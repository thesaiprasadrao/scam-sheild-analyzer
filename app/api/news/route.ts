import { NextResponse } from 'next/server'

export async function GET() {
  const API_KEY = process.env.NEWSDATA_API_KEY
  
  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=cybercrime OR scam OR fraud OR phishing&language=en&country=in`;

  try {
    // Encode the URL to handle special characters in the query
    const encodedUrl = encodeURI(url)
    console.log('Fetching news from:', encodedUrl)

    const response = await fetch(encodedUrl, {
      headers: {
        'Accept': 'application/json'
      },
      next: {
        revalidate: 300 // Cache for 5 minutes
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid API Response:', data)
      throw new Error('Invalid response format from news API')
    }

    // Log success
    console.log(`Successfully fetched ${data.results.length} news items`)
    
    return NextResponse.json({
      status: 'success',
      totalResults: data.totalResults,
      results: data.results
    })

  } catch (error) {
    console.error('News API Error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to fetch news',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
