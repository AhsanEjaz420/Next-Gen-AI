# NXTGENAI - AI-Powered Content Creation Platform

A comprehensive suite of AI-powered tools designed for content creators, marketers, and businesses to streamline their content creation workflow.

## 🚀 Features

### Core AI Tools
- **Caption Generator**: Create engaging social media captions
- **Hashtag Generator**: Generate relevant hashtags for social media posts
- **Content Ideas Generator**: Get fresh content ideas for your niche
- **Blog & SEO Writer**: Create SEO-optimized blog content
- **Email Reply Assistant**: Generate professional email responses

### Premium Features
- **Social Calendar**: Plan and schedule social media content
- **Product Description Generator**: Create compelling product descriptions
- **Competitor Analysis**: Analyze competitor strategies

### Platform Features
- **User Authentication**: Secure login and registration
- **Payment Integration**: Stripe integration for premium features
- **Usage History**: Track your AI tool usage
- **Profile Management**: Manage your account settings
- **Admin Dashboard**: Comprehensive admin panel

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Robust database with SQLAlchemy ORM
- **Alembic**: Database migration tool
- **OpenAI Integration**: GPT models for AI capabilities
- **Stripe**: Payment processing
- **JWT Authentication**: Secure user authentication

### Frontend
- **React 19**: Modern React with latest features
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icons
- **React Hot Toast**: Toast notifications

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- OpenAI API key
- Stripe API keys (for payments)

## 🚀 Installation

### Backend Setup

1. Clone the repository
```bash
git clone <repository-url>
cd NXTGENAI-main
```

2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your API keys and database URL
```

5. Run database migrations
```bash
alembic upgrade head
```

6. Start the backend server
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory
```bash
cd NXTGENAI-Tools-main/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost/dbname
OPENAI_API_KEY=your_openai_api_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SECRET_KEY=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

## 📱 Usage

1. Register for a new account
2. Explore free AI tools
3. Upgrade to premium for advanced features
4. Track your usage in the history section
5. Manage your profile and subscription

## 🎥 Demo

Check out the screen recording to see the platform in action:

<video width="800" controls autoplay muted>
  <source src="Screen Recording 2026-03-16 140813_compressed.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

*Download the original video: [Screen Recording 2026-03-16 140813.mp4](Screen%20Recording%202026-03-16%20140813.mp4)*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using modern web technologies and AI capabilities.
