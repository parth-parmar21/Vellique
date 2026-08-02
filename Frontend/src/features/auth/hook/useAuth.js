import { useDispatch } from 'react-redux'
import { register, login } from '../service/auth.api'
import { setUser, setLoading, setError } from '../state/auth.slice'

export const useAuth = () => {
    const dispatch = useDispatch()

    async function handleRegister({ email, contact, password, fullName, isSeller = false }) {
        const data = await register({ email, contact, password, fullName, isSeller })
        dispatch(setUser(data.user))
    }

    async function handleLogin({ email, password }) {
        const data = await login(email, password)
        dispatch(setUser(data.user))
    }

    return {
        handleRegister,
        handleLogin
    }
}