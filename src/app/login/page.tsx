import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm space-y-8 p-6 sm:p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Puros
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Please sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 rounded-lg text-base 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-white
                         border border-gray-300 dark:border-gray-600
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                         focus:border-transparent
                         transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 rounded-lg text-base 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-white
                         border border-gray-300 dark:border-gray-600
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                         focus:border-transparent
                         transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              formAction={login}
              className="relative w-full flex items-center justify-center px-4 py-3 rounded-lg
                       text-base font-medium text-white
                       bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                       transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              Sign in
            </button>
            <Link
              href="/signup"
              className="relative w-full flex items-center justify-center px-4 py-3 rounded-lg
                       text-base font-medium text-gray-900 dark:text-white
                       border border-gray-300 dark:border-gray-600
                       hover:bg-gray-50 dark:hover:bg-gray-700
                       transition-all duration-200 active:scale-[0.98]"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}