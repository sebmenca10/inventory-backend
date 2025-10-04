const autocannon = require('autocannon')
const fetch = require('node-fetch')
const fs = require('fs')

const BASE_URL = 'http://localhost:3000'
const CONNECTIONS = 100
const DURATION = 120
const LOGIN_BODY = {
  email: 'administrador@example.com',
  password: '123456',
}

async function getToken() {
  console.log('Iniciando sesión para obtener token...')
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(LOGIN_BODY),
  })

  if (!res.ok) {
    console.error('Error al iniciar sesión:', res.status, await res.text())
    process.exit(1)
  }

  const data = await res.json()
  console.log('Token obtenido correctamente.\n')
  return data.access_token
}

async function runLoadTest() {
  const token = await getToken()

  console.log(`Iniciando prueba de carga (100 req/s x 2 min) sobre ${BASE_URL}/products ...`)

  const instance = autocannon(
    {
      url: `${BASE_URL}/products`,
      connections: CONNECTIONS,
      duration: DURATION,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    (err, result) => {
      if (err) throw err
      console.log('\n Prueba completada.')
      console.log(' Resultados resumidos:\n')
      autocannon.printResult(result)

      fs.writeFileSync('load-test-result.json', JSON.stringify(result, null, 2))
      console.log('\n Resultado guardado en: load-test-result.json\n')

      setTimeout(() => process.exit(0), 500)
    }
  )

  process.once('SIGINT', () => {
    instance.stop()
    console.log('\nPrueba interrumpida por el usuario.')
  })
}

runLoadTest()