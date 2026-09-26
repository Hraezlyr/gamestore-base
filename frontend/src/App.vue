<script setup>
import { ref, onMounted } from 'vue'

const health = ref(null)
const error = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:8000/api/v1/health/')
    if (!res.ok) throw new Error(`HTTP ${res.status}: Error al conectar con la API`)
    health.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main style="font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h1>🎮 GameStore — Panel de Control (Sprint 0)</h1>
    <p>Verificación de infraestructura multi-contenedor:</p>

    <div v-if="loading" style="color: #64748b;">
      Verificando estado de los servicios...
    </div>

    <div v-else-if="health" style="background: #f0fdf4; border: 1px solid #86efac; padding: 1rem; border-radius: 6px; color: #166534;">
      <h3>✅ Estado del Sistema: ONLINE</h3>
      <p><strong>Servicio:</strong> {{ health.service }}</p>
      <p><strong>Base de Datos (PostgreSQL):</strong> {{ health.database }}</p>
      <p><strong>Backend:</strong> Django REST Framework</p>
    </div>

    <div v-else-if="error" style="background: #fef2f2; border: 1px solid #fca5a5; padding: 1rem; border-radius: 6px; color: #991b1b;">
      <h3>❌ Error de Conexión</h3>
      <p>{{ error }}</p>
      <small>Revisa que el contenedor del backend esté corriendo en el puerto 8000 y CORS esté habilitado.</small>
    </div>
  </main>
</template>