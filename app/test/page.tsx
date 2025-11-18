export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, the basic routing is working!</p>
        <a href="/login" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Go to Login
        </a>
      </div>
    </div>
  )
}
