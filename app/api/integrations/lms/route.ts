import { NextRequest, NextResponse } from 'next/server'
import LMSIntegrationService from '@/lib/lmsIntegrationService'

const lmsService = new LMSIntegrationService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const connections = lmsService.getConnections(userId)
    return NextResponse.json({ connections })

  } catch (error) {
    console.error('LMS connections fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch LMS connections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, lmsType, credentials } = await request.json()

    if (!userId || !lmsType || !credentials) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    let connection

    switch (lmsType) {
      case 'canvas':
        connection = await lmsService.connectCanvas(
          userId,
          credentials.apiKey,
          credentials.baseUrl
        )
        break
      case 'blackboard':
        connection = await lmsService.connectBlackboard(
          userId,
          credentials.accessToken,
          credentials.baseUrl
        )
        break
      case 'moodle':
        connection = await lmsService.connectMoodle(
          userId,
          credentials.token,
          credentials.baseUrl
        )
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported LMS type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ connection })

  } catch (error) {
    console.error('LMS connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to LMS' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { connectionId } = await request.json()

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      )
    }

    await lmsService.disconnectLMS(connectionId)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('LMS disconnection error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect LMS' },
      { status: 500 }
    )
  }
}
