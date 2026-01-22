import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home Page', () => {
  it('renders the Solar Calculator title', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', {
      name: /Solar Calculator for Commercial Vehicles/i
    })

    expect(heading).toBeInTheDocument()
  })

  it('displays the coming soon message', () => {
    render(<Home />)

    const message = screen.getByText(/Coming soon: Calculate your solar panel ROI/i)

    expect(message).toBeInTheDocument()
  })

  it('shows deployment success indicator', () => {
    render(<Home />)

    const successMessage = screen.getByText(/Deployed successfully on Vercel!/i)

    expect(successMessage).toBeInTheDocument()
  })
})
