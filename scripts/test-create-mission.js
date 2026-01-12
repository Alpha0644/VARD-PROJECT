// Test direct de l'API création mission
const testData = {
    title: "Mission Test Direct",
    description: "Test description",
    location: "Paris Centre",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    latitude: 48.8566,
    longitude: 2.3522
}

console.log('📤 Envoi des données :', JSON.stringify(testData, null, 2))

fetch('http://localhost:3000/api/missions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Cookie': 'authjs.session-token=test' // On verra l'erreur d'auth
    },
    body: JSON.stringify(testData)
})
    .then(res => res.json())
    .then(data => {
        console.log('\n📥 Réponse API :', JSON.stringify(data, null, 2))
    })
    .catch(err => {
        console.error('\n❌ Erreur :', err)
    })
