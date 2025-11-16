import { supabase } from './supabase'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Get auth token from Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getHeaders()
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      const errorMessage = new Error(error.detail || `HTTP error! status: ${response.status}`)
      // Attach response data for better error handling
      ;(errorMessage as any).response = { data: error }
      throw errorMessage
    }

    return response.json()
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Add trailing slash for root routes (e.g., /api/miracles/), but not for paths with segments
    // Routes with path params (e.g., /api/users/{id}/stats) should not have trailing slashes
    let normalizedEndpoint = endpoint
    // Check if endpoint ends with a path segment (e.g., /stats, /pray, /{id})
    const hasPathSegment = /\/[^\/]+$/.test(endpoint)
    if (!endpoint.includes('?') && !hasPathSegment) {
      // Add trailing slash if endpoint doesn't end with a path segment
      normalizedEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`
    }
    return this.request<T>(normalizedEndpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    // Add trailing slash for root routes, but not for paths with segments
    let normalizedEndpoint = endpoint
    const hasPathSegment = /\/[^\/]+$/.test(endpoint)
    if (!endpoint.includes('?') && !hasPathSegment) {
      normalizedEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`
    }
    return this.request<T>(normalizedEndpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    // Add trailing slash for root routes, but not for paths with segments
    let normalizedEndpoint = endpoint
    const hasPathSegment = /\/[^\/]+$/.test(endpoint)
    if (!endpoint.includes('?') && !hasPathSegment) {
      normalizedEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`
    }
    return this.request<T>(normalizedEndpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Add trailing slash for root routes, but not for paths with segments
    let normalizedEndpoint = endpoint
    const hasPathSegment = /\/[^\/]+$/.test(endpoint)
    if (!endpoint.includes('?') && !hasPathSegment) {
      normalizedEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`
    }
    return this.request<T>(normalizedEndpoint, { ...options, method: 'DELETE' })
  }

  async uploadFile(endpoint: string, file: File, folder: string = 'general'): Promise<{ url: string; path: string; filename: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const headers: HeadersInit = {}
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()

