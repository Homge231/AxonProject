import gameRoutes from './routes/gameRoutes'

// existing:
app.use('/auth', authRoutes)
app.use('/api/user', userRoutes)

// add:
app.use('/api/game', gameRoutes)