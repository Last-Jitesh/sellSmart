import { requireAuth } from '@clerk/express'

/**
 * We wrap the official requireAuth so that we can map req.auth.userId to req.userId
 * to keep compatibility with all our existing routes.
 */
export default function clerkAuth(req, res, next) {
  // 1. Run the official middleware
  requireAuth()(req, res, (err) => {
    if (err) {
      console.error('Clerk Auth Error:', err.message)
      return res.status(401).json({ message: 'Unauthorized' })
    }
    
    // 2. Map the userId
    if (req.auth && req.auth.userId) {
      req.userId = req.auth.userId
      next()
    } else {
      res.status(401).json({ message: 'No user ID found in token' })
    }
  })
}
