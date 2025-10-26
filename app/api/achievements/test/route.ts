import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'

const ACHIEVEMENTS_FILE = path.join(process.cwd(), 'data', 'achievements.json')

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const userId = session.user.id
  
  try {
    // Lire les trophées existants
    let existingAchievements = []
    if (fs.existsSync(ACHIEVEMENTS_FILE)) {
      const data = fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8')
      existingAchievements = JSON.parse(data)
    }
    
    // Créer des trophées de test pour les 50 nouveaux trophées
    const testAchievements = [
      // Trophées d'examens (10)
      { id: `${userId}_first_exam_bronze_${Date.now()}`, userId, type: 'first_exam', level: 'bronze', value: 1, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_perfect_1_bronze_${Date.now() + 1}`, userId, type: 'exam_perfect', level: 'bronze', value: 1, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_perfect_3_silver_${Date.now() + 2}`, userId, type: 'exam_perfect', level: 'silver', value: 3, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_perfect_5_gold_${Date.now() + 3}`, userId, type: 'exam_perfect', level: 'gold', value: 5, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_score_80_bronze_${Date.now() + 4}`, userId, type: 'exam_score_80', level: 'bronze', value: 3, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_score_90_silver_${Date.now() + 5}`, userId, type: 'exam_score_90', level: 'silver', value: 3, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_score_95_gold_${Date.now() + 6}`, userId, type: 'exam_score_95', level: 'gold', value: 3, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_ready_gold_${Date.now() + 7}`, userId, type: 'exam_ready', level: 'gold', value: 1, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_master_gold_${Date.now() + 8}`, userId, type: 'exam_master', level: 'gold', value: 10, unlockedAt: new Date().toISOString() },
      { id: `${userId}_exam_legend_gold_${Date.now() + 9}`, userId, type: 'exam_legend', level: 'gold', value: 25, unlockedAt: new Date().toISOString() },
      
      // Trophées d'entraînement (10)
      { id: `${userId}_training_first_bronze_${Date.now() + 10}`, userId, type: 'training_first', level: 'bronze', value: 1, unlockedAt: new Date().toISOString() },
      { id: `${userId}_training_5_bronze_${Date.now() + 11}`, userId, type: 'training_5', level: 'bronze', value: 5, unlockedAt: new Date().toISOString() },
      { id: `${userId}_training_10_bronze_${Date.now() + 12}`, userId, type: 'training_10', level: 'bronze', value: 10, unlockedAt: new Date().toISOString() },
      { id: `${userId}_training_25_silver_${Date.now() + 13}`, userId, type: 'training_25', level: 'silver', value: 25, unlockedAt: new Date().toISOString() },
      { id: `${userId}_training_50_gold_${Date.now() + 14}`, userId, type: 'training_50', level: 'gold', value: 50, unlockedAt: new Date().toISOString() },
      { id: `${userId}_training_100_gold_${Date.now() + 15}`, userId, type: 'training_100', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_answers_streak_5_bronze_${Date.now() + 16}`, userId, type: 'answers_streak', level: 'bronze', value: 5, unlockedAt: new Date().toISOString() },
      { id: `${userId}_answers_streak_10_silver_${Date.now() + 17}`, userId, type: 'answers_streak', level: 'silver', value: 10, unlockedAt: new Date().toISOString() },
      { id: `${userId}_answers_streak_25_gold_${Date.now() + 18}`, userId, type: 'answers_streak', level: 'gold', value: 25, unlockedAt: new Date().toISOString() },
      { id: `${userId}_answers_streak_50_gold_${Date.now() + 19}`, userId, type: 'answers_streak', level: 'gold', value: 50, unlockedAt: new Date().toISOString() },
      
      // Trophées de temps (5)
      { id: `${userId}_daily_streak_3_bronze_${Date.now() + 20}`, userId, type: 'daily_streak', level: 'bronze', value: 3, unlockedAt: new Date().toISOString() },
      { id: `${userId}_daily_streak_7_bronze_${Date.now() + 21}`, userId, type: 'daily_streak', level: 'bronze', value: 7, unlockedAt: new Date().toISOString() },
      { id: `${userId}_daily_streak_30_silver_${Date.now() + 22}`, userId, type: 'daily_streak', level: 'silver', value: 30, unlockedAt: new Date().toISOString() },
      { id: `${userId}_daily_streak_100_gold_${Date.now() + 23}`, userId, type: 'daily_streak', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_early_bird_bronze_${Date.now() + 24}`, userId, type: 'early_bird', level: 'bronze', value: 1, unlockedAt: new Date().toISOString() },
      
      // Trophées de vitesse (5)
      { id: `${userId}_speed_lightning_bronze_${Date.now() + 25}`, userId, type: 'speed_lightning', level: 'bronze', value: 10, unlockedAt: new Date().toISOString() },
      { id: `${userId}_speed_rocket_silver_${Date.now() + 26}`, userId, type: 'speed_rocket', level: 'silver', value: 25, unlockedAt: new Date().toISOString() },
      { id: `${userId}_speed_supersonic_gold_${Date.now() + 27}`, userId, type: 'speed_supersonic', level: 'gold', value: 50, unlockedAt: new Date().toISOString() },
      { id: `${userId}_sniper_silver_${Date.now() + 28}`, userId, type: 'sniper', level: 'silver', value: 10, unlockedAt: new Date().toISOString() },
      { id: `${userId}_ninja_gold_${Date.now() + 29}`, userId, type: 'ninja', level: 'gold', value: 20, unlockedAt: new Date().toISOString() },
      
      // Trophées de catégories (20)
      { id: `${userId}_category_signalisation_bronze_${Date.now() + 30}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_signalisation_gold_${Date.now() + 31}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_regles_bronze_${Date.now() + 32}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_regles_gold_${Date.now() + 33}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_freins_bronze_${Date.now() + 34}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_freins_gold_${Date.now() + 35}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_poids_bronze_${Date.now() + 36}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_poids_gold_${Date.now() + 37}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_permis_bronze_${Date.now() + 38}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_permis_gold_${Date.now() + 39}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_moteur_bronze_${Date.now() + 40}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_moteur_gold_${Date.now() + 41}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_otr_bronze_${Date.now() + 42}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_otr_gold_${Date.now() + 43}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_entretien_bronze_${Date.now() + 44}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_entretien_gold_${Date.now() + 45}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_chargement_bronze_${Date.now() + 46}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_chargement_gold_${Date.now() + 47}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_roues_bronze_${Date.now() + 48}`, userId, type: 'category_master', level: 'bronze', value: 80, unlockedAt: new Date().toISOString() },
      { id: `${userId}_category_roues_gold_${Date.now() + 49}`, userId, type: 'category_master', level: 'gold', value: 100, unlockedAt: new Date().toISOString() },
      
      // Trophées de questionnaires (5)
      { id: `${userId}_questionnaire_1_bronze_${Date.now() + 50}`, userId, type: 'questionnaire_master', level: 'bronze', value: 1, unlockedAt: new Date().toISOString() },
      { id: `${userId}_questionnaire_2_bronze_${Date.now() + 51}`, userId, type: 'questionnaire_master', level: 'bronze', value: 1, unlockedAt: new Date().toISOString() },
      { id: `${userId}_questionnaire_3_silver_${Date.now() + 52}`, userId, type: 'questionnaire_master', level: 'silver', value: 1, unlockedAt: new Date().toISOString() },
      { id: `${userId}_questionnaire_4_silver_${Date.now() + 53}`, userId, type: 'questionnaire_master', level: 'silver', value: 1, unlockedAt: new Date().toISOString() },
      { id: `${userId}_questionnaire_5_gold_${Date.now() + 54}`, userId, type: 'questionnaire_master', level: 'gold', value: 1, unlockedAt: new Date().toISOString() },
      
      // Trophées de progression (5)
      { id: `${userId}_total_correct_50_bronze_${Date.now() + 55}`, userId, type: 'total_correct', level: 'bronze', value: 50, unlockedAt: new Date().toISOString() },
      { id: `${userId}_total_correct_250_silver_${Date.now() + 56}`, userId, type: 'total_correct', level: 'silver', value: 250, unlockedAt: new Date().toISOString() },
      { id: `${userId}_total_correct_500_gold_${Date.now() + 57}`, userId, type: 'total_correct', level: 'gold', value: 500, unlockedAt: new Date().toISOString() },
      { id: `${userId}_total_correct_1000_gold_${Date.now() + 58}`, userId, type: 'total_correct', level: 'gold', value: 1000, unlockedAt: new Date().toISOString() },
      { id: `${userId}_collector_gold_${Date.now() + 59}`, userId, type: 'collector', level: 'gold', value: 25, unlockedAt: new Date().toISOString() }
    ]
    
    // Vérifier si les trophées existent déjà
    const newAchievements = testAchievements.filter(test => 
      !existingAchievements.some((existing: any) => 
        existing.userId === test.userId && 
        existing.type === test.type && 
        existing.level === test.level
      )
    )
    
    if (newAchievements.length > 0) {
      existingAchievements.push(...newAchievements)
      fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(existingAchievements, null, 2))
    }
    
    return NextResponse.json({ 
      success: true, 
      created: newAchievements.length,
      message: `${newAchievements.length} trophées de test créés avec succès`
    })
  } catch (error) {
    console.error('Erreur lors de la création des trophées de test:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création des trophées de test' },
      { status: 500 }
    )
  }
}
