# Domain Data Model (Step 1.1)

This is the entity-relationship design for [`detailed-plan.md`](./detailed-plan.md) Milestone 1. It is a paper design step: no Prisma code yet. The goal is to agree on entities, cardinality, and tenancy boundaries before schema work starts in Step 1.2 onward.

Scope: `Fleet`, `FleetMembership`, `Vehicle`, `Calculation`, `CalculationInputSnapshot`, `CalculationResult`, `CalculationScenario`, `ReportJob`, `AuditEvent`, `FeatureFlag`, plus the existing `User` model.

## Tenancy rule

A `Fleet` is the tenant. Every domain row that isn't platform-global carries a `fleetId`, directly or transitively through a parent that already carries one. A user can belong to more than one fleet, with a different role in each — that's what `FleetMembership` is for.

## ER diagram

```mermaid
erDiagram
    USER ||--o{ FLEET_MEMBERSHIP : "holds"
    FLEET ||--o{ FLEET_MEMBERSHIP : "has members"
    FLEET ||--o{ VEHICLE : "owns"
    FLEET ||--o{ CALCULATION : "owns"
    FLEET ||--o{ REPORT_JOB : "owns"
    FLEET ||--o{ AUDIT_EVENT : "scopes"
    FLEET ||--o{ FEATURE_FLAG : "scopes"

    VEHICLE ||--o{ CALCULATION : "analyzed by"
    USER ||--o{ CALCULATION : "requested by"
    USER ||--o{ REPORT_JOB : "requested by"
    USER ||--o{ AUDIT_EVENT : "acted as"

    CALCULATION ||--|| CALCULATION_SCENARIO : "has one scenario"
    CALCULATION_SCENARIO ||--|| CALCULATION_INPUT_SNAPSHOT : "frozen inputs"
    CALCULATION_SCENARIO ||--|| CALCULATION_RESULT : "computed output"
    CALCULATION_SCENARIO ||--o{ REPORT_JOB : "exported as"

    USER {
        string id PK
        string email UK
        string name
    }

    FLEET {
        string id PK
        string name
        enum type "van | truck | trailer | bus"
        datetime createdAt
    }

    FLEET_MEMBERSHIP {
        string id PK
        string fleetId FK
        string userId FK
        enum role "OWNER | MANAGER | VIEWER"
        datetime createdAt
    }

    VEHICLE {
        string id PK
        string fleetId FK
        string manufacturer
        string model
        enum vehicleType "van | truck | trailer | bus"
        enum engineType "diesel | petrol | electric | hybrid"
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
        string city
        string country
        datetime deletedAt "soft delete"
        datetime createdAt
    }

    CALCULATION {
        string id PK
        string fleetId FK
        string vehicleId FK
        string requestedByUserId FK
        string notes
        datetime createdAt
    }

    CALCULATION_SCENARIO {
        string id PK
        string calculationId FK UK "1-1, one scenario per calculation for now"
        string label
        string formulaVersion
        string assumptionSetVersion
        datetime createdAt
    }

    CALCULATION_INPUT_SNAPSHOT {
        string id PK
        string calculationScenarioId FK UK "1-1"
        json vehicleSpec "frozen vehicle fields, including location"
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

- **Fleet is the tenant.** Every authorization check is a single `fleetId` comparison.
- **A user can belong to multiple fleets, with a different role in each.** `FleetMembership` is the join table between `User` and `Fleet`; `role` lives on the membership, not on `User`, since the same person can be an `OWNER` on one fleet and a `VIEWER` on another.
- **`Fleet.type` reuses the same enum as `Vehicle.vehicleType`** (`van | truck | trailer | bus`) rather than defining a second category system — a fleet's type is just what kind of vehicles it predominantly runs.
- **No separate `LocationProfile` entity.** The product has no "manage my sites" feature and no need to run a calculation against a different site than the vehicle's own — city, country, and parking fields live directly on `Vehicle`. A shared, reusable site record would be solving a problem the app doesn't have yet.
- **`Vehicle` rows are a spec + quantity, not one row per physical vehicle.** This matches the current calculator form (`numberOfVehicles` field) and avoids inventing per-VIN tracking the product doesn't need yet.
- **`Calculation` is the durable request; `CalculationScenario` is its one computed run.** One scenario per calculation for now — no re-run versioning or supersession yet. That's deferred until the product actually needs to compare multiple assumption sets (Milestone 4).
- **`CalculationInputSnapshot` and `CalculationResult` are 1-1 with `CalculationScenario`, never updated.** This is what makes a displayed ROI number reproducible: the exact inputs (including the vehicle's location fields at the time) and the exact output are frozen together at compute time (Step 2.5's provenance panel reads directly from this pair).
- **`ReportJob` points at a `CalculationScenario`, not a `Calculation`.** A report is a rendering of one specific computed result, so it needs the immutable scenario, not the mutable parent request.
- **`AuditEvent` uses a polymorphic `entityType`/`entityId` pair instead of per-entity foreign keys.** It needs to reference memberships, vehicles, calculations, report jobs, and feature flags alike; a hard FK per entity type would require a nullable column per type. `fleetId` and `actorUserId` are nullable to cover platform-level and system-initiated events (e.g. a failed login before any fleet context exists).
- **`FeatureFlag.fleetId` is nullable.** A null-fleet row is a platform-wide default; a fleet-scoped row overrides it. `@@unique([fleetId, key])` (added in Step 1.2+) enforces one value per flag per fleet.
- **Deletion is soft on `Vehicle` only.** `deletedAt` preserves the FK target for historical `Calculation` rows (Step 1.8's test: deleting a vehicle must not destroy calculation evidence). Every other entity here is either immutable once written (`CalculationScenario`, `CalculationInputSnapshot`, `CalculationResult`), append-only (`AuditEvent`), or has no history to protect.

## Open questions for review

- Should `CalculationResult` store the pre-conversion currency amount too, in case the conversion source is later disputed?
- Does `ReportJob` need its own `fleetId`, or is it always derivable through `calculationScenarioId → calculation → fleet`? Kept denormalized here for cheap authorization checks without a join, consistent with Step 2.1's `requireFleetRole` helper.
