import { getServerSession } from "next-auth"
import { authOptions } from "./route"

export const auth = () => getServerSession(authOptions) 