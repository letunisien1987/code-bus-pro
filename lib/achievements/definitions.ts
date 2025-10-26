export interface AchievementDefinition {
  id: string
  type: string
  level: 'bronze' | 'silver' | 'gold'
  title: string
  description: string
  icon: string // emoji ou nom d'icône
  requirement: number
  category: 'exam' | 'answers' | 'streak' | 'category' | 'readiness' | 'training' | 'speed' | 'time' | 'meta' | 'questionnaire'
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ===== TROPHÉES D'EXAMENS (10 trophées) =====
  { id: 'first_exam', type: 'first_exam', level: 'bronze', title: 'Premier pas', description: 'Passer votre premier examen', icon: '👶', requirement: 1, category: 'exam' },
  { id: 'exam_perfect_1', type: 'exam_perfect_1', level: 'bronze', title: 'Tour sans erreur', description: '1 examen sans erreurs', icon: '🏆', requirement: 1, category: 'exam' },
  { id: 'exam_perfect_3', type: 'exam_perfect_3', level: 'silver', title: '3 tours parfaits', description: '3 examens sans erreurs consécutifs', icon: '🏆', requirement: 3, category: 'exam' },
  { id: 'exam_perfect_5', type: 'exam_perfect_5', level: 'gold', title: '5 tours parfaits', description: '5 examens sans erreurs consécutifs', icon: '🏆', requirement: 5, category: 'exam' },
  { id: 'exam_score_80', type: 'exam_score_80', level: 'bronze', title: 'Bien joué', description: '3 examens >80% consécutifs', icon: '👍', requirement: 3, category: 'exam' },
  { id: 'exam_score_90', type: 'exam_score_90', level: 'silver', title: 'Excellent', description: '3 examens >90% consécutifs', icon: '⭐', requirement: 3, category: 'exam' },
  { id: 'exam_score_95', type: 'exam_score_95', level: 'gold', title: 'Parfait', description: '3 examens >95% consécutifs', icon: '💎', requirement: 3, category: 'exam' },
  { id: 'exam_ready', type: 'exam_ready', level: 'gold', title: 'Prêt pour l\'examen', description: '5 examens >90% + toutes catégories >80%', icon: '✅', requirement: 1, category: 'readiness' },
  { id: 'exam_master', type: 'exam_master', level: 'gold', title: 'Maître des examens', description: '10 examens réussis', icon: '👑', requirement: 10, category: 'exam' },
  { id: 'exam_legend', type: 'exam_legend', level: 'gold', title: 'Légende', description: '25 examens réussis', icon: '🌟', requirement: 25, category: 'exam' },

  // ===== TROPHÉES D'ENTRAÎNEMENT (6 trophées) =====
  { id: 'training_first', type: 'training_first', level: 'bronze', title: 'Premier entraînement', description: 'Compléter votre premier entraînement', icon: '🎯', requirement: 1, category: 'training' },
  { id: 'training_5', type: 'training_5', level: 'bronze', title: 'Débutant', description: '5 sessions d\'entraînement', icon: '🌱', requirement: 5, category: 'training' },
  { id: 'training_10', type: 'training_10', level: 'bronze', title: 'Régulier', description: '10 sessions d\'entraînement', icon: '💪', requirement: 10, category: 'training' },
  { id: 'training_25', type: 'training_25', level: 'silver', title: 'Dévoué', description: '25 sessions d\'entraînement', icon: '🔥', requirement: 25, category: 'training' },
  { id: 'training_50', type: 'training_50', level: 'gold', title: 'Passionné', description: '50 sessions d\'entraînement', icon: '🚀', requirement: 50, category: 'training' },
  { id: 'training_100', type: 'training_100', level: 'gold', title: 'Expert', description: '100 sessions d\'entraînement', icon: '🏅', requirement: 100, category: 'training' },

  // ===== TROPHÉES DE RÉPONSES (8 trophées) =====
  { id: 'answers_streak_5', type: 'answers_streak_5', level: 'bronze', title: '5 en suite', description: '5 réponses correctes consécutives', icon: '🔥', requirement: 5, category: 'answers' },
  { id: 'answers_streak_10', type: 'answers_streak_10', level: 'silver', title: '10 en suite', description: '10 réponses correctes consécutives', icon: '🔥', requirement: 10, category: 'answers' },
  { id: 'answers_streak_25', type: 'answers_streak_25', level: 'gold', title: '25 en suite', description: '25 réponses correctes consécutives', icon: '🔥', requirement: 25, category: 'answers' },
  { id: 'answers_streak_50', type: 'answers_streak_50', level: 'gold', title: '50 en suite', description: '50 réponses correctes consécutives', icon: '🔥', requirement: 50, category: 'answers' },
  { id: 'total_correct_50', type: 'total_correct_50', level: 'bronze', title: 'Débutant', description: '50 réponses correctes', icon: '📚', requirement: 50, category: 'answers' },
  { id: 'total_correct_250', type: 'total_correct_250', level: 'silver', title: 'Expert', description: '250 réponses correctes', icon: '📚', requirement: 250, category: 'answers' },
  { id: 'total_correct_500', type: 'total_correct_500', level: 'gold', title: 'Maître', description: '500 réponses correctes', icon: '📚', requirement: 500, category: 'answers' },
  { id: 'total_correct_1000', type: 'total_correct_1000', level: 'gold', title: 'Légende', description: '1000 réponses correctes', icon: '👑', requirement: 1000, category: 'answers' },

  // ===== TROPHÉES DE TEMPS (5 trophées) =====
  { id: 'daily_streak_3', type: 'daily_streak_3', level: 'bronze', title: '3 jours', description: '3 jours consécutifs d\'activité', icon: '📅', requirement: 3, category: 'streak' },
  { id: 'daily_streak_7', type: 'daily_streak_7', level: 'bronze', title: '7 jours', description: '7 jours consécutifs d\'activité', icon: '📅', requirement: 7, category: 'streak' },
  { id: 'daily_streak_30', type: 'daily_streak_30', level: 'silver', title: '30 jours', description: '30 jours consécutifs d\'activité', icon: '📅', requirement: 30, category: 'streak' },
  { id: 'daily_streak_100', type: 'daily_streak_100', level: 'gold', title: '100 jours', description: '100 jours consécutifs d\'activité', icon: '📅', requirement: 100, category: 'streak' },
  
  // ===== TROPHÉES DE RÉGULARITÉ AVEC QUALITÉ (3 trophées) =====
  { id: 'perfect_week', type: 'perfect_week', level: 'silver', title: 'Semaine parfaite', description: '7 jours consécutifs avec de bonnes performances', icon: '⭐', requirement: 7, category: 'streak' },
  { id: 'perfect_month', type: 'perfect_month', level: 'gold', title: 'Mois parfait', description: '30 jours consécutifs avec de bonnes performances', icon: '🌟', requirement: 30, category: 'streak' },
  { id: 'centenary', type: 'centenary', level: 'gold', title: 'Centenaire', description: '100 jours consécutifs avec de bonnes performances', icon: '💎', requirement: 100, category: 'streak' },
  { id: 'early_bird', type: 'early_bird', level: 'bronze', title: 'Lève-tôt', description: 'S\'entraîner avant 8h du matin', icon: '🌅', requirement: 1, category: 'time' },

  // ===== TROPHÉES DE VITESSE (5 trophées) =====
  { id: 'speed_lightning', type: 'speed_lightning', level: 'bronze', title: 'Éclair', description: '10 questions en moins de 2 minutes', icon: '⚡', requirement: 10, category: 'speed' },
  { id: 'speed_rocket', type: 'speed_rocket', level: 'silver', title: 'Fusée', description: '25 questions en moins de 5 minutes', icon: '🚀', requirement: 25, category: 'speed' },
  { id: 'speed_supersonic', type: 'speed_supersonic', level: 'gold', title: 'Supersonique', description: '50 questions en moins de 10 minutes', icon: '💨', requirement: 50, category: 'speed' },
  { id: 'sniper', type: 'sniper', level: 'silver', title: 'Sniper', description: '10 réponses correctes d\'affilée sans erreur', icon: '🎯', requirement: 10, category: 'answers' },
  { id: 'ninja', type: 'ninja', level: 'gold', title: 'Ninja', description: '20 réponses correctes d\'affilée sans erreur', icon: '🥷', requirement: 20, category: 'answers' },

  // ===== TROPHÉES DE CATÉGORIES (20 trophées) =====
  // Signalisation routière et vitesse
  { id: 'category_signalisation_bronze', type: 'category_signalisation_bronze', level: 'bronze', title: 'Signalisation débutant', description: '80% de réussite en Signalisation routière et vitesse', icon: '🚦', requirement: 80, category: 'category' },
  { id: 'category_signalisation_gold', type: 'category_signalisation_gold', level: 'gold', title: 'Expert Signalisation', description: '100% de réussite en Signalisation routière et vitesse', icon: '🚦', requirement: 100, category: 'category' },
  
  // Règles et prescriptions
  { id: 'category_regles_bronze', type: 'category_regles_bronze', level: 'bronze', title: 'Règles débutant', description: '80% de réussite en Règles et prescriptions', icon: '📋', requirement: 80, category: 'category' },
  { id: 'category_regles_gold', type: 'category_regles_gold', level: 'gold', title: 'Expert Règles', description: '100% de réussite en Règles et prescriptions', icon: '📋', requirement: 100, category: 'category' },
  
  // Freins
  { id: 'category_freins_bronze', type: 'category_freins_bronze', level: 'bronze', title: 'Freins débutant', description: '80% de réussite en Freins', icon: '🛑', requirement: 80, category: 'category' },
  { id: 'category_freins_gold', type: 'category_freins_gold', level: 'gold', title: 'Expert Freins', description: '100% de réussite en Freins', icon: '🛑', requirement: 100, category: 'category' },
  
  // Poids et mesures
  { id: 'category_poids_bronze', type: 'category_poids_bronze', level: 'bronze', title: 'Poids débutant', description: '80% de réussite en Poids et mesures', icon: '⚖️', requirement: 80, category: 'category' },
  { id: 'category_poids_gold', type: 'category_poids_gold', level: 'gold', title: 'Expert Poids', description: '100% de réussite en Poids et mesures', icon: '⚖️', requirement: 100, category: 'category' },
  
  // Permis
  { id: 'category_permis_bronze', type: 'category_permis_bronze', level: 'bronze', title: 'Permis débutant', description: '80% de réussite en Permis', icon: '🆔', requirement: 80, category: 'category' },
  { id: 'category_permis_gold', type: 'category_permis_gold', level: 'gold', title: 'Expert Permis', description: '100% de réussite en Permis', icon: '🆔', requirement: 100, category: 'category' },
  
  // Moteur
  { id: 'category_moteur_bronze', type: 'category_moteur_bronze', level: 'bronze', title: 'Moteur débutant', description: '80% de réussite en Moteur', icon: '🔧', requirement: 80, category: 'category' },
  { id: 'category_moteur_gold', type: 'category_moteur_gold', level: 'gold', title: 'Expert Moteur', description: '100% de réussite en Moteur', icon: '🔧', requirement: 100, category: 'category' },
  
  // OTR 1
  { id: 'category_otr_bronze', type: 'category_otr_bronze', level: 'bronze', title: 'OTR débutant', description: '80% de réussite en OTR 1', icon: '🚛', requirement: 80, category: 'category' },
  { id: 'category_otr_gold', type: 'category_otr_gold', level: 'gold', title: 'Expert OTR', description: '100% de réussite en OTR 1', icon: '🚛', requirement: 100, category: 'category' },
  
  // Entretien
  { id: 'category_entretien_bronze', type: 'category_entretien_bronze', level: 'bronze', title: 'Entretien débutant', description: '80% de réussite en Entretien', icon: '🔧', requirement: 80, category: 'category' },
  { id: 'category_entretien_gold', type: 'category_entretien_gold', level: 'gold', title: 'Expert Entretien', description: '100% de réussite en Entretien', icon: '🔧', requirement: 100, category: 'category' },
  
  // Chargement
  { id: 'category_chargement_bronze', type: 'category_chargement_bronze', level: 'bronze', title: 'Chargement débutant', description: '80% de réussite en Chargement', icon: '📦', requirement: 80, category: 'category' },
  { id: 'category_chargement_gold', type: 'category_chargement_gold', level: 'gold', title: 'Expert Chargement', description: '100% de réussite en Chargement', icon: '📦', requirement: 100, category: 'category' },
  
  // Roues et pneumatiques
  { id: 'category_roues_bronze', type: 'category_roues_bronze', level: 'bronze', title: 'Roues débutant', description: '80% de réussite en Roues et pneumatiques', icon: '🛞', requirement: 80, category: 'category' },
  { id: 'category_roues_gold', type: 'category_roues_gold', level: 'gold', title: 'Expert Roues', description: '100% de réussite en Roues et pneumatiques', icon: '🛞', requirement: 100, category: 'category' },

  // ===== TROPHÉES DE QUESTIONNAIRES (5 trophées) =====
  { id: 'questionnaire_1', type: 'questionnaire_1', level: 'bronze', title: 'Questionnaire 1', description: 'Maîtriser le questionnaire 1', icon: '📝', requirement: 1, category: 'questionnaire' },
  { id: 'questionnaire_2', type: 'questionnaire_2', level: 'bronze', title: 'Questionnaire 2', description: 'Maîtriser le questionnaire 2', icon: '📝', requirement: 1, category: 'questionnaire' },
  { id: 'questionnaire_3', type: 'questionnaire_3', level: 'silver', title: 'Questionnaire 3', description: 'Maîtriser le questionnaire 3', icon: '📝', requirement: 1, category: 'questionnaire' },
  { id: 'questionnaire_4', type: 'questionnaire_4', level: 'silver', title: 'Questionnaire 4', description: 'Maîtriser le questionnaire 4', icon: '📝', requirement: 1, category: 'questionnaire' },
  { id: 'questionnaire_5', type: 'questionnaire_5', level: 'gold', title: 'Questionnaire 5', description: 'Maîtriser le questionnaire 5', icon: '📝', requirement: 1, category: 'questionnaire' },

  // ===== TROPHÉES DE PERFORMANCE (5 trophées) =====
  { id: 'performance_bronze', type: 'performance_score_700', level: 'bronze', title: 'Performeur Bronze', description: 'Obtenir un score de 700+ points', icon: '🥉', requirement: 1, category: 'exam' },
  { id: 'performance_silver', type: 'performance_score_800', level: 'silver', title: 'Performeur Argent', description: 'Obtenir un score de 800+ points', icon: '🥈', requirement: 1, category: 'exam' },
  { id: 'performance_gold', type: 'performance_score_900', level: 'gold', title: 'Performeur Or', description: 'Obtenir un score de 900+ points', icon: '🥇', requirement: 1, category: 'exam' },
  { id: 'speed_master', type: 'speed_bonus_max_5x', level: 'gold', title: 'Maître de la Vitesse', description: 'Obtenir le bonus vitesse maximum (300 pts) 5 fois', icon: '⚡', requirement: 5, category: 'speed' },
  { id: 'perfect_exam', type: 'performance_score_1000', level: 'gold', title: 'Examen Parfait', description: 'Score de 1000 points (100% + vitesse max)', icon: '💎', requirement: 1, category: 'exam' },
]
