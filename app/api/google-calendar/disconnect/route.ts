import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // In production, revoke tokens and remove from database
    // For now, we'll return a mock response
    const mockResponse = {
      success: true,
      message: 'Successfully disconnected from Google Calendar'
    }

    // TODO: Implement actual token revocation and cleanup
    // const tokens = await getStoredTokens(userId)
    // if (tokens?.accessToken) {
    //   // Revoke the token with Google
    //   await fetch('https://oauth2.googleapis.com/revoke', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     body: new URLSearchParams({
    //       token: tokens.accessToken,
    //     }),
    //   })
    // }

    // // Remove tokens from database
    // await removeStoredTokens(userId)

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('Google Calendar disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
