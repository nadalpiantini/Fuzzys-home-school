import {
  LearningProfile,
  ActivityAttempt,
  AdaptiveRecommendation,
  ZPDAssessment,
  ErrorPattern,
  AdaptiveConfig,
  KnowledgeState
} from './types';

export class AdaptiveEngine {
  private config: AdaptiveConfig;

  constructor(config: Partial<AdaptiveConfig> = {}) {
    this.config = {
      difficultyAdjustmentFactor: 0.2,
      masteryThreshold: 0.8,
      reviewSpacingBase: 2,
      maxDifficultyJump: 0.2,
      minSessionGap: 5,
      errorWeightFactor: 0.3,
      ...config
    };
  }

  /**
   * Generate adaptive recommendations based on learning profile
   */
  generateRecommendations(
    profile: LearningProfile,
    availableActivities: Array<{ id: string; concept: string; difficulty: number; gameType: string }>
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    // 1. Check for concepts that need review (spaced repetition)
    const reviewRecommendations = this.getReviewRecommendations(profile, availableActivities);
    recommendations.push(...reviewRecommendations);

    // 2. Identify next concepts in ZPD (Zone of Proximal Development)
    const nextConceptRecommendations = this.getNextConceptRecommendations(profile, availableActivities);
    recommendations.push(...nextConceptRecommendations);

    // 3. Suggest remediation for error patterns
    const remediationRecommendations = this.getRemediationRecommendations(profile, availableActivities);
    recommendations.push(...remediationRecommendations);

    // 4. Check if break is needed
    const breakRecommendation = this.getBreakRecommendation(profile);
    if (breakRecommendation) {
      recommendations.push(breakRecommendation);
    }

    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const scoreA = priorityWeight[a.priority] + a.confidence;
      const scoreB = priorityWeight[b.priority] + b.confidence;
      return scoreB - scoreA;
    });
  }

  /**
   * Update learning profile based on activity attempt
   */
  updateProfile(profile: LearningProfile, attempt: ActivityAttempt): LearningProfile {
    const updatedProfile = { ...profile };
    const concept = attempt.concept;

    // Update knowledge state for the concept
    const currentKnowledge = updatedProfile.knowledgeMap[concept] || {
      concept,
      mastery: 0,
      confidence: 0,
      lastReviewed: new Date(),
      reviewCount: 0,
      errorPatterns: []
    };

    // Calculate new mastery level using exponential moving average
    const alpha = 0.3; // Learning rate
    const newMastery = alpha * attempt.score + (1 - alpha) * currentKnowledge.mastery;

    // Update confidence based on consistency
    const confidenceBoost = attempt.completed ? 0.1 : -0.05;
    const newConfidence = Math.max(0, Math.min(1, currentKnowledge.confidence + confidenceBoost));

    // Update error patterns
    const newErrorPatterns = [...currentKnowledge.errorPatterns];
    attempt.mistakes.forEach(mistake => {
      if (!newErrorPatterns.includes(mistake.errorType)) {
        newErrorPatterns.push(mistake.errorType);
      }
    });

    updatedProfile.knowledgeMap[concept] = {
      ...currentKnowledge,
      mastery: newMastery,
      confidence: newConfidence,
      lastReviewed: new Date(),
      reviewCount: currentKnowledge.reviewCount + 1,
      errorPatterns: newErrorPatterns
    };

    // Update overall performance
    const totalAttempts = updatedProfile.performance.completedActivities + 1;
    const newAverageScore = (
      (updatedProfile.performance.averageScore * updatedProfile.performance.completedActivities) +
      attempt.score
    ) / totalAttempts;

    updatedProfile.performance = {
      ...updatedProfile.performance,
      averageScore: newAverageScore,
      totalStudyTime: updatedProfile.performance.totalStudyTime + Math.floor(attempt.timeSpent / 60),
      completedActivities: totalAttempts
    };

    // Update streak
    const today = new Date().toDateString();
    const lastUpdate = updatedProfile.updatedAt.toDateString();
    if (today !== lastUpdate) {
      const daysDiff = Math.floor((new Date().getTime() - updatedProfile.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        updatedProfile.performance.streakDays += 1;
      } else if (daysDiff > 1) {
        updatedProfile.performance.streakDays = 1; // Reset streak
      }
    }

    updatedProfile.updatedAt = new Date();

    return updatedProfile;
  }

  /**
   * Calculate optimal difficulty for next activity
   */
  calculateOptimalDifficulty(profile: LearningProfile, concept: string): number {
    const knowledge = profile.knowledgeMap[concept];

    if (!knowledge) {
      // New concept - start with easier difficulty
      return Math.max(0.1, profile.preferences.difficulty - 0.2);
    }

    const masteryLevel = knowledge.mastery;
    const confidence = knowledge.confidence;

    // Base difficulty on mastery and confidence
    let optimalDifficulty = masteryLevel * 0.7 + confidence * 0.3;

    // Adjust based on recent performance
    const recentPerformance = profile.performance.averageScore;
    if (recentPerformance < 0.6) {
      optimalDifficulty -= this.config.difficultyAdjustmentFactor;
    } else if (recentPerformance > 0.85) {
      optimalDifficulty += this.config.difficultyAdjustmentFactor;
    }

    // Apply user preferences
    optimalDifficulty = (optimalDifficulty + profile.preferences.difficulty) / 2;

    // Ensure within bounds and not too big a jump
    return Math.max(0.1, Math.min(0.9, optimalDifficulty));
  }

  /**
   * Assess Zone of Proximal Development for a concept
   */
  assessZPD(profile: LearningProfile, concept: string, prerequisiteConcepts: string[] = []): ZPDAssessment {
    const knowledge = profile.knowledgeMap[concept];
    const currentLevel = knowledge?.mastery || 0;

    // Check readiness based on prerequisites
    const readinessIndicators: string[] = [];
    const scaffoldingNeeded: string[] = [];

    prerequisiteConcepts.forEach(prereq => {
      const prereqKnowledge = profile.knowledgeMap[prereq];
      if (prereqKnowledge && prereqKnowledge.mastery >= this.config.masteryThreshold) {
        readinessIndicators.push(`Mastered prerequisite: ${prereq}`);
      } else {
        scaffoldingNeeded.push(`Review ${prereq} (current: ${Math.round((prereqKnowledge?.mastery || 0) * 100)}%)`);
      }
    });

    // Determine target level based on current performance
    const targetLevel = Math.min(1, currentLevel + 0.2);

    // Suggest next concepts if current concept is mastered
    const nextConcepts: string[] = [];
    if (currentLevel >= this.config.masteryThreshold) {
      // This would typically come from a curriculum map
      nextConcepts.push(`Advanced ${concept}`, `Applications of ${concept}`);
    }

    return {
      concept,
      currentLevel,
      targetLevel,
      scaffoldingNeeded,
      readinessIndicators,
      nextConcepts
    };
  }

  /**
   * Analyze error patterns and suggest remediation
   */
  analyzeErrorPatterns(attempts: ActivityAttempt[]): ErrorPattern[] {
    const patternMap = new Map<string, ErrorPattern>();

    attempts.forEach(attempt => {
      attempt.mistakes.forEach(mistake => {
        const key = `${mistake.errorType}-${attempt.concept}`;

        if (patternMap.has(key)) {
          const pattern = patternMap.get(key)!;
          pattern.frequency += 1;
          pattern.lastSeen = attempt.endTime || attempt.startTime;
        } else {
          patternMap.set(key, {
            pattern: mistake.errorType,
            frequency: 1,
            concept: attempt.concept,
            severity: 'medium',
            remediation: this.getRemediationStrategy(mistake.errorType),
            lastSeen: attempt.endTime || attempt.startTime
          });
        }
      });
    });

    // Determine severity based on frequency
    Array.from(patternMap.values()).forEach(pattern => {
      if (pattern.frequency >= 5) {
        pattern.severity = 'high';
      } else if (pattern.frequency <= 2) {
        pattern.severity = 'low';
      }
    });

    return Array.from(patternMap.values());
  }

  private getReviewRecommendations(
    profile: LearningProfile,
    activities: Array<{ id: string; concept: string; difficulty: number; gameType: string }>
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];
    const now = new Date();

    Object.values(profile.knowledgeMap).forEach(knowledge => {
      const daysSinceReview = Math.floor(
        (now.getTime() - knowledge.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Spaced repetition algorithm
      const optimalInterval = Math.pow(this.config.reviewSpacingBase, knowledge.reviewCount);

      if (daysSinceReview >= optimalInterval && knowledge.mastery < this.config.masteryThreshold) {
        const suitableActivity = activities.find(a =>
          a.concept === knowledge.concept &&
          Math.abs(a.difficulty - knowledge.mastery) <= 0.3
        );

        if (suitableActivity) {
          recommendations.push({
            type: 'concept_review',
            activityId: suitableActivity.id,
            gameType: suitableActivity.gameType,
            concept: knowledge.concept,
            difficulty: this.calculateOptimalDifficulty(profile, knowledge.concept),
            reasoning: `Review needed for ${knowledge.concept} (last reviewed ${daysSinceReview} days ago)`,
            confidence: Math.min(0.9, knowledge.confidence + 0.2),
            priority: knowledge.mastery < 0.5 ? 'high' : 'medium',
            estimatedTime: 10
          });
        }
      }
    });

    return recommendations;
  }

  private getNextConceptRecommendations(
    profile: LearningProfile,
    activities: Array<{ id: string; concept: string; difficulty: number; gameType: string }>
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    // Find concepts not yet in knowledge map (new concepts)
    const knownConcepts = new Set(Object.keys(profile.knowledgeMap));
    const availableConcepts = new Set(activities.map(a => a.concept));

    Array.from(availableConcepts).forEach(concept => {
      if (!knownConcepts.has(concept)) {
        const suitableActivity = activities.find(a =>
          a.concept === concept &&
          a.difficulty <= profile.preferences.difficulty + 0.2
        );

        if (suitableActivity) {
          recommendations.push({
            type: 'next_activity',
            activityId: suitableActivity.id,
            gameType: suitableActivity.gameType,
            concept: concept,
            difficulty: this.calculateOptimalDifficulty(profile, concept),
            reasoning: `New concept ready to explore: ${concept}`,
            confidence: 0.7,
            priority: 'medium',
            estimatedTime: 15
          });
        }
      }
    });

    return recommendations;
  }

  private getRemediationRecommendations(
    profile: LearningProfile,
    activities: Array<{ id: string; concept: string; difficulty: number; gameType: string }>
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    Object.values(profile.knowledgeMap).forEach(knowledge => {
      if (knowledge.errorPatterns.length > 0 && knowledge.mastery < 0.6) {
        const suitableActivity = activities.find(a =>
          a.concept === knowledge.concept &&
          a.difficulty < knowledge.mastery // Easier activity for remediation
        );

        if (suitableActivity) {
          recommendations.push({
            type: 'difficulty_adjustment',
            activityId: suitableActivity.id,
            gameType: suitableActivity.gameType,
            concept: knowledge.concept,
            difficulty: Math.max(0.1, knowledge.mastery - 0.2),
            reasoning: `Remediation needed for ${knowledge.concept} (error patterns detected)`,
            confidence: 0.8,
            priority: 'high',
            estimatedTime: 12
          });
        }
      }
    });

    return recommendations;
  }

  private getBreakRecommendation(profile: LearningProfile): AdaptiveRecommendation | null {
    const now = new Date();
    const sessionTime = profile.performance.totalStudyTime;

    // Suggest break if study session is too long
    if (sessionTime > profile.preferences.sessionLength) {
      return {
        type: 'break_suggestion',
        reasoning: `Study session has exceeded preferred length (${profile.preferences.sessionLength} min)`,
        confidence: 0.9,
        priority: 'medium',
        estimatedTime: 5
      };
    }

    return null;
  }

  private getRemediationStrategy(errorType: string): string[] {
    const strategies: Record<string, string[]> = {
      'conceptual_misunderstanding': [
        'Provide visual examples',
        'Use analogies and metaphors',
        'Break down into smaller steps'
      ],
      'procedural_error': [
        'Practice similar problems',
        'Review step-by-step procedures',
        'Use guided practice'
      ],
      'attention_error': [
        'Highlight key information',
        'Use checklists',
        'Reduce cognitive load'
      ],
      'memory_error': [
        'Use spaced repetition',
        'Create memory aids',
        'Practice retrieval'
      ]
    };

    return strategies[errorType] || [
      'Provide additional practice',
      'Review foundational concepts',
      'Use alternative explanations'
    ];
  }
}