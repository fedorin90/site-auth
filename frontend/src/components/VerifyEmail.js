import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const VerifyEmail = () => {
  const { userId } = useParams() // Получаем userId из URL.

  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/verify/${userId}` // Запрос к серверу.
        )
        toast.success(response.data.message) // Устанавливаем успешное сообщение.
        navigate('/login')
      } catch (err) {
        toast.error(err.response?.data?.error || 'Something went wrong') // Устанавливаем сообщение об ошибке.
        navigate('/')
      }
    }

    verifyEmail() // Вызываем функцию при загрузке компонента.
  }, [userId, navigate])

  return <div></div>
}

export default VerifyEmail
