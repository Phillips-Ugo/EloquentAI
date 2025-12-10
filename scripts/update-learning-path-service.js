#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Update the LearningPathOptimization component to use the enhanced service
const componentPath = path.join(__dirname, '../components/dashboard/LearningPathOptimization.tsx');

console.log('🔄 Updating LearningPathOptimization component to use enhanced service...');

try {
  // Read the current component
  let content = fs.readFileSync(componentPath, 'utf8');
  
  // Add the enhanced service import
  const importToAdd = "import EnhancedLearningPathService from '@/lib/enhancedLearningPathService'";
  
  // Find the import section and add the new import
  const importSection = content.indexOf("import LoadingSpinner from '@/components/ui/LoadingSpinner'");
  if (importSection !== -1) {
    const insertPoint = content.indexOf('\n', importSection) + 1;
    content = content.slice(0, insertPoint) + importToAdd + '\n' + content.slice(insertPoint);
  }
  
  // Add the service instance
  const serviceInstance = `
  // Enhanced Learning Path Service
  const learningPathService = new EnhancedLearningPathService();
  `;
  
  // Find the component function and add the service instance
  const componentStart = content.indexOf('const LearningPathOptimization = () => {');
  if (componentStart !== -1) {
    const insertPoint = content.indexOf('{', componentStart) + 1;
    content = content.slice(0, insertPoint) + serviceInstance + '\n' + content.slice(insertPoint);
  }
  
  // Update the generateIntelligentLearningPath function
  const oldFunction = `const generateIntelligentLearningPath = async (careerGoal: string) => {
    try {
      setLoading(true);
      addToast('Generating intelligent learning path...', 'info');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a sample learning path
      const samplePath = {
        id: 'path-' + Date.now(),
        name: \`Intelligent \${careerGoal} Learning Path\`,
        description: \`AI-generated learning path for \${careerGoal}\`,
        totalDuration: 16,
        difficulty: 'intermediate',
        progress: 0,
        tags: ['ai-generated', 'personalized'],
        category: careerGoal,
        isActive: true,
        prerequisites: [],
        learningStyle: 'mixed',
        timeCommitment: 10,
        careerOutcomes: [careerGoal],
        skillsGained: ['Problem Solving', 'Critical Thinking'],
        certifications: [],
        goals: [
          {
            id: 'goal-1',
            title: \`Master \${careerGoal} Fundamentals\`,
            description: \`Learn the core concepts and principles of \${careerGoal}\`,
            category: 'skill',
            priority: 'high',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'not-started',
            prerequisites: [],
            estimatedHours: 40,
            progress: 0,
            tags: ['fundamentals'],
            difficulty: 'beginner',
            resources: [],
            dependencies: [],
            notes: '',
            timeSpent: 0,
            milestones: [],
            calendarEvents: []
          }
        ],
        milestones: []
      };
      
      setLearningPaths(prev => [...prev, samplePath]);
      addToast('Learning path generated successfully!', 'success');
      
    } catch (error) {
      console.error('Error generating learning path:', error);
      addToast('Failed to generate learning path', 'error');
    } finally {
      setLoading(false);
    }
  };`;
  
  const newFunction = `const generateIntelligentLearningPath = async (careerGoal: string) => {
    try {
      setLoading(true);
      addToast('Generating intelligent learning path...', 'info');
      
      // Create user profile from current state
      const userProfile = {
        id: user?.id || 'default-user',
        userId: user?.id || 'default-user',
        university: userProfile?.university || 'Not specified',
        major: userProfile?.major || 'Not specified',
        year: userProfile?.year || 'Not specified',
        interests: userProfile?.interests || [],
        careerGoals: [careerGoal],
        learningStyle: userProfile?.learningStyle || 'mixed',
        timeAvailability: {
          weekdays: 2,
          weekends: 4,
          preferredTimes: ['morning', 'evening']
        },
        currentSkills: userProfile?.currentSkills || [],
        targetSkills: userProfile?.targetSkills || [],
        experienceLevel: userProfile?.experienceLevel || 'beginner'
      };
      
      // Generate learning path using enhanced service
      const learningPath = await learningPathService.generateLearningPath(userProfile, careerGoal);
      
      setLearningPaths(prev => [...prev, learningPath]);
      addToast('Learning path generated successfully!', 'success');
      
    } catch (error) {
      console.error('Error generating learning path:', error);
      addToast('Failed to generate learning path. Using fallback.', 'warning');
      
      // Fallback to simple path
      const fallbackPath = {
        id: 'path-' + Date.now(),
        name: \`\${careerGoal} Learning Path\`,
        description: \`Basic learning path for \${careerGoal}\`,
        totalDuration: 12,
        difficulty: 'intermediate',
        progress: 0,
        tags: ['fallback'],
        category: careerGoal,
        isActive: true,
        prerequisites: [],
        learningStyle: 'mixed',
        timeCommitment: 8,
        careerOutcomes: [careerGoal],
        skillsGained: ['Problem Solving'],
        certifications: [],
        goals: [],
        milestones: []
      };
      
      setLearningPaths(prev => [...prev, fallbackPath]);
    } finally {
      setLoading(false);
    }
  };`;
  
  // Replace the function
  content = content.replace(oldFunction, newFunction);
  
  // Write the updated content back
  fs.writeFileSync(componentPath, content);
  
  console.log('✅ LearningPathOptimization component updated successfully!');
  console.log('📝 Changes made:');
  console.log('  - Added EnhancedLearningPathService import');
  console.log('  - Added service instance');
  console.log('  - Updated generateIntelligentLearningPath function to use enhanced service');
  console.log('  - Added fallback handling for when AI service fails');
  
} catch (error) {
  console.error('❌ Error updating component:', error);
  process.exit(1);
}
