# Domain Data Model (Step 1.1)

This is the entity-relationship design for [`detailed-plan.md`](./detailed-plan.md) Milestone 1. It is a paper design step: no Prisma code yet. The goal is to agree on entities, cardinality, and tenancy boundaries before schema work starts in Step 1.2 onward.

Scope: `Fleet`, `FleetMembership`, `Vehicle`, `LocationProfile`, `Calculation`, `CalculationInputSnapshot`, `CalculationResult`, `CalculationScenario`, `ReportJob`, `AuditEvent`, `FeatureFlag`, plus the existing `User` model.

## Tenancy rule

A `Fleet` is the tenant. There is no separate `Organization` layer above it (see [`vacancy-match-analysis.md`](./vacancy-match-analysis.md)). Every domain row that isn't platform-global carries a `fleetId`, directly or transitively through a parent that already carries one.

## ER diagram

```mermaid
erDiagram
    USER ||--o{ FLEET_MEMBERSHIP : "holds"
    FLEET ||--o{ FLEET_MEMBERSHIP : "has members"
    FLEET ||--o{ VEHICLE : "owns"
    FLEET ||--o{ LOCATION_PROFILE : "owns"
    FLEET ||--o{ CALCULATION : "owns"
    FLEET ||--o{ REPORT_JOB : "owns"
    FLEET ||--o{ AUDIT_EVENT : "scopes"
    FLEET ||--o{ FEATURE_FLAG : "scopes"

    LOCATION_PROFILE ||--o{ VEHICLE : "home site of"
    LOCATION_PROFILE ||--o{ CALCULATION : "site used by"

    VEHICLE ||--o{ CALCULATION : "analyzed by"
    USER ||--o{ CALCULATION : "requested by"
    USER ||--o{ REPORT_JOB : "requested by"
    USER ||--o{ AUDIT_EVENT : "acted as"

    CALCULATION ||--o{ CALCULATION_SCENARIO : "has runs"
    CALCULATION_SCENARIO ||--|| CALCULATION_INPUT_SNAPSHOT : "frozen inputs"
    CALCULATION_SCENARIO ||--|| CALCULATION_RESULT : "computed output"
    CALCULATION_SCENARIO ||--o| CALCULATION_SCENARIO : "supersedes"
    CALCULATION_SCENARIO ||--o{ REPORT_JOB : "exported as"

    USER {
        string id PK
        string email UK
        string name
    }

    FLEET {
        string id PK
        string name
        datetime createdAt
    }

    FLEET_MEMBERSHIP {
        string id PK
        string fleetId FK
        string userId FK
        enum role "OWNER | FLEET_MANAGER | ANALYST | VIEWER"
        datetime createdAt
    }

    LOCATION_PROFILE {
        string id PK
        string fleetId FK
        string label
        string city
        string country
        float latitude
        float longitude
        enum daytimeParking "outdoor | covered | indoor | mixed"
        enum nighttimeParking "outdoor | covered | indoor | mixed"
        datetime createdAt
    }

    VEHICLE {
        string id PK
        string fleetId FK
        string homeLocationProfileId FK
        string manufacturer
        string model
        enum vehicleType "van | truck | trailer | bus"
        enum engineType "diesel | petrol | electric"
        enum parkingType "depot | street | customer_site | mixed"
        int quantity
        float averageDailyDistanceKm
        float energyConsumptionKwhPer100km
        float solarPanelCapacityKw
        enum solarPanelPlacement "roof | sides | back | all_over"
        float payloadReserveKg
        float maxRoofLoadKg
        int operatingMonthsPerYear
        boolean winterUsage
        datetime deletedAt "soft delete"
        datetime createdAt
    }

    CALCULATION {
        string id PK
        string fleetId FK
        string vehicleId FK
        string locationProfileId FK
        string requestedByUserId FK
        string notes
        datetime createdAt
    }

    CALCULATION_SCENARIO {
        string id PK
        string calculationId FK
        string supersedesScenarioId FK "nullable, self-relation"
        string label
        string formulaVersion
        string assumptionSetVersion
        boolean isCurrent
        datetime createdAt
    }

    CALCULATION_INPUT_SNAPSHOT {
        string id PK
        string calculationScenarioId FK UK "1-1"
        json vehicleSpec "frozen vehicle fields"
        json locationSpec "frozen location fields"
        string energyPriceAssumptionVersion
        string emissionsFactorVersion
        string solarYieldAssumptionVersion
        string currencyConversionSourceVersion
        datetime capturedAt
    }

    CALCULATION_RESULT {
        string id PK
        string calculationScenarioId FK UK "1-1"
        float paybackPeriodMonths
        float totalSolarYieldKwh
        float co2SavedKg
        decimal netSavingsAmount
        string currency
        datetime computedAt
    }

    REPORT_JOB {
        string id PK
        string fleetId FK
        string calculationScenarioId FK
        string requestedByUserId FK
        enum status "QUEUED | VALIDATING | CALCULATING | RENDERING_CHARTS | GENERATING_REPORT | GENERATING_RECOMMENDATIONS | COMPLETED | FAILED | CANCELLED"
        string idempotencyKey UK
        string temporalWorkflowId
        string fileUrl
        datetime createdAt
        datetime updatedAt
    }

    AUDIT_EVENT {
        string id PK
        string fleetId FK "nullable, platform-level events"
        string actorUserId FK "nullable, system events"
        string action
        string entityType
        string entityId
        json metadata
        datetime createdAt
    }

    FEATURE_FLAG {
        string id PK
        string fleetId FK "nullable = platform default"
        string key
        boolean enabled
        json payload
        datetime updatedAt
    }
```

## Design decisions

- **Fleet is the tenant, not a child of one.** No `Organization` table exists. This removes a layer the vacancy analysis doesn't require and keeps every authorization check to a single `fleetId` comparison.
- **`Vehicle` rows are a spec + quantity, not one row per physical vehicle.** This matches the current calculator form (`numberOfVehicles` field) and avoids inventing per-VIN tracking the product doesn't need yet.
- **`LocationProfile` is shared, not embedded in `Vehicle` or `Calculation`.** A fleet's sites (depots) are reused across vehicles and across calculation runs, and a calculation's `locationProfileId` can point at a different site than the vehicle's `homeLocationProfileId` for "what if we parked at site B" comparisons.
- **`Calculation` is the durable request; `CalculationScenario` is the append-only run.** Re-running a calculation (new assumptions, new formula version) creates a new `CalculationScenario` row rather than mutating the old one. `supersedesScenarioId` links a new run back to the one it replaces so history is traceable; `isCurrent` marks the one the UI shows by default.
- **`CalculationInputSnapshot` and `CalculationResult` are 1-1 with `CalculationScenario`, never updated.** This is what makes a displayed ROI number reproducible: the exact inputs and the exact output are frozen together at compute time (Step 2.5's provenance panel reads directly from this pair).
- **`ReportJob` points at a `CalculationScenario`, not a `Calculation`.** A report is a rendering of one specific computed result, so it needs the immutable scenario, not the mutable parent request.
- **`AuditEvent` uses a polymorphic `entityType`/`entityId` pair instead of per-entity foreign keys.** It needs to reference memberships, vehicles, calculations, report jobs, and feature flags alike; a hard FK per entity type would require a nullable column per type. `fleetId` and `actorUserId` are nullable to cover platform-level and system-initiated events (e.g. a failed login before any fleet context exists).
- **`FeatureFlag.fleetId` is nullable.** A null-fleet row is a platform-wide default; a fleet-scoped row overrides it. `@@unique([fleetId, key])` (added in Step 1.2+) enforces one value per flag per fleet.
- **Deletion is soft on `Vehicle` only.** `deletedAt` preserves the FK target for historical `Calculation` rows (Step 1.8's test: deleting a vehicle must not destroy calculation evidence). Every other entity here is either append-only (`CalculationScenario`, `AuditEvent`) or has no history to protect.

## Open questions for review

- Should `CalculationResult` store currency-converted amounts only, or also the original currency amount before conversion (for audit purposes if the conversion source is later disputed)?
- Does `ReportJob` need its own `fleetId`, or is it always derivable through `calculationScenarioId → calculation → fleetId`? Kept denormalized here for cheap authorization checks without a join, consistent with Step 2.1's `requireFleetRole` helper.
- Is one `LocationProfile` per depot enough, or do we need per-vehicle solar-panel placement independent of the site (a vehicle's own roof/side/back mount vs. where it parks)? Currently modeled on `Vehicle`, which seems right, but flagging since the current UI form groups it with location.
