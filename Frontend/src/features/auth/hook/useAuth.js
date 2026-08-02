import { useDispatch } from 'react-redux'
import { register } from '../service/auth.api'
import { setUser, setLoading, setError } from '../state/auth.slice'

export const useAuth = () => {
    const dispatch = useDispatch()

    async function handleRegister({ email, contact, password, fullName, isSeller = false }) {
        const data = await register({ email, contact, password, fullName, isSeller })

        dispatch(setUser(data.user))
    }

    return {
        handleRegister
    }
}