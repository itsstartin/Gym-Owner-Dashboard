import axios from '../axios'
const getMembers = ()=> axios.get('members/get')
export default getMembers