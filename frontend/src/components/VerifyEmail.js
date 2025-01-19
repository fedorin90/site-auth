import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const VerifyEmail = () => {
  const { userId } = useParams() // Получаем userId из URL.
  const [message, setMessage] = useState('') // Сообщение для отображения.
  const [error, setError] = useState('') // Ошибка, если есть.

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/verify/${userId}` // Запрос к серверу.
        )
        setMessage(response.data.message) // Устанавливаем успешное сообщение.
      } catch (err) {
        setError(err.response?.data?.error || 'Something went wrong') // Устанавливаем сообщение об ошибке.
      }
    }

    verifyEmail() // Вызываем функцию при загрузке компонента.
  }, [userId])

  return (
    <div>
      {message && <h2 style={{ color: 'green' }}>{message}</h2>}
      {error && <h2 style={{ color: 'red' }}>{error}</h2>}
    </div>
  )
}

export default VerifyEmail
