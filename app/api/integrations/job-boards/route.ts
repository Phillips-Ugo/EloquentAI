import { NextRequest, NextResponse } from 'next/server'
import JobBoardIntegrationService from '@/lib/jobBoardIntegrationService'

const jobBoardService = new JobBoardIntegrationService()

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

    const connections = jobBoardService.getConnections(userId)
    return NextResponse.json({ connections })

  } catch (error) {
    console.error('Job board connections fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job board connections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, platform, credentials } = await request.json()

    if (!userId || !platform || !credentials) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    let connection

    switch (platform) {
      case 'linkedin':
        connection = await jobBoardService.connectLinkedIn(
          userId,
          credentials.accessToken
        )
        break
      case 'indeed':
        connection = await jobBoardService.connectIndeed(
          userId,
          credentials.apiKey
        )
        break
      case 'glassdoor':
        connection = await jobBoardService.connectGlassdoor(
          userId,
          credentials.partnerId,
          credentials.apiKey
        )
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported job board platform' },
          { status: 400 }
        )
    }

    return NextResponse.json({ connection })

  } catch (error) {
    console.error('Job board connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to job board' },
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

    await jobBoardService.disconnectJobBoard(connectionId)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Job board disconnection error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect job board' },
      { status: 500 }
    )
  }
}
