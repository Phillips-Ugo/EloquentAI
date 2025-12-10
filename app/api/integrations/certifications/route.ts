import { NextRequest, NextResponse } from 'next/server'
import CertificationTrackingService from '@/lib/certificationTrackingService'

const certificationService = new CertificationTrackingService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'certifications':
        const certifications = certificationService.getUserCertifications(userId)
        return NextResponse.json({ certifications })
      
      case 'goals':
        const goals = certificationService.getUserGoals(userId)
        return NextResponse.json({ goals })
      
      case 'providers':
        const providers = certificationService.getProviders()
        return NextResponse.json({ providers })
      
      case 'insights':
        const skills = searchParams.get('skills')?.split(',') || []
        const insights = await certificationService.getCertificationInsights(userId)
        return NextResponse.json({ insights })
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Certifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certifications data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'add-certification':
        const certification = await certificationService.addCertification(userId, data)
        return NextResponse.json({ certification })
      
      case 'create-goal':
        const goal = await certificationService.createCertificationGoal(
          userId,
          data.certificationId,
          new Date(data.targetDate),
          data.priority
        )
        return NextResponse.json({ goal })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Certifications action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform certification action' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { goalId, sessionId, progress, notes } = await request.json()

    if (!goalId || !sessionId || progress === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    await certificationService.updateStudyProgress(goalId, sessionId, progress, notes)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Study progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update study progress' },
      { status: 500 }
    )
  }
}
