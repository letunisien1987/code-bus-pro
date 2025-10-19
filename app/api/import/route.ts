import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    console.log('🔄 Démarrage de l\'import via script...')
    
    // Exécuter le script d'import avec plus de détails
    const { stdout, stderr } = await execAsync('./scripts/force-import.sh', {
      cwd: process.cwd()
    })

    if (stderr) {
      console.error('Erreur du script:', stderr)
    }

    console.log('📊 Résultat du script:', stdout)

    // Parser le résultat JSON du script
    const lines = stdout.trim().split('\n')
    const jsonLine = lines[lines.length - 1] // La dernière ligne contient le JSON
    
    try {
      const result = JSON.parse(jsonLine)
      
      if (result.success) {
        console.log(`✅ Import réussi : ${result.imported} questions importées`)
        return NextResponse.json({
          success: true,
          message: `${result.imported} questions importées avec succès`,
          imported: result.imported,
          total: result.total,
          imagesFound: result.imagesFound
        })
      } else {
        throw new Error('Le script a échoué')
      }
    } catch (parseError) {
      console.error('Erreur de parsing du résultat:', parseError)
      throw new Error('Impossible de parser le résultat du script')
    }

  } catch (error) {
    console.error('Erreur lors de l\'importation:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de l\'importation des données',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
