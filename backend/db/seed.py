from sqlalchemy.orm import Session
from datetime import date

from db.database import SessionLocal  # oppure il tuo import corretto
from db.model import User, Achievement, UserAchievement, Author, Article, Tag, ArticleTag, Leaderboard, Configuration

def seed():
    db: Session = SessionLocal()

    # Evita di duplicare se già popolato
    if db.query(User).first():
        print("Dati già presenti.")
        return

    # Users
    user = User(
        id='1',
        name='Gabriele',
        email='gabbo@ai.com',
        role='consumer',
        avatar='https://forums.terraria.org/data/avatars/h/197/197802.jpg',
        level=6,
        xp=619,
        xpToNext=81,
        totalXp=619,
        joinDate=date(2025, 5, 5)
    )
    db.add(user)


    # Configurations (new)
    config = Configuration(
        id='1',
        tone_preference='friendly',
        length_preference='short',
        format_preference='text',
        age_preference=30,
        user=user  # link configuration to user
    )
    db.add(config)

    # Achievements
    achievements = [
        Achievement(id='1', name='First Steps', description='Read your first article', icon='📖', xpReward=50),
        Achievement(id='2', name='Speed Reader', description='Read 10 articles in one day', icon='⚡', xpReward=200)
    ]
    db.add_all(achievements)

    # UserAchievements
    user_achievements = [
        UserAchievement(userId='1', achievementId='1', unlockedAt=date(2025, 5, 15)),
        UserAchievement(userId='1', achievementId='2', unlockedAt=date(2025, 5, 20))
    ]
    db.add_all(user_achievements)

    # Authors
    authors = [
        Author(id='a1', name='Sarah Johnson', avatar='https://images.unsplash.com/photo-1742234857006-ceaba909665c?w=100&h=100&fit=crop'),
        Author(id='a2', name='Paolo', avatar='https://www.plai-accelerator.com/content/uploads/2024/05/ruscitti-e1715625676685.jpg'),
        Author(id='a3', name='Emma Wilson', avatar='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop')
    ]
    db.add_all(authors)

    # Articles
    articles = [
        Article(
            id='1',
            title='The Future of Web Development',
            excerpt='Exploring the latest trends...',
            content="""
                <h2>Introduction</h2>
                <p>Web development continues to evolve at a rapid pace, with new frameworks, tools, and methodologies emerging regularly. In this comprehensive guide, we'll explore the key trends that are shaping the future of web development.</p>
                
                <h2>AI Integration</h2>
                <p>Artificial Intelligence is becoming increasingly integrated into web development workflows. From automated code generation to intelligent debugging, AI tools are revolutionizing how we build web applications.</p>
                
                <h2>WebAssembly Revolution</h2>
                <p>WebAssembly (WASM) is opening new possibilities for web applications, allowing developers to run high-performance code written in languages like C++, Rust, and Go directly in the browser.</p>
                
                <h2>Edge Computing</h2>
                <p>Edge computing is bringing computation closer to users, reducing latency and improving performance. This shift is changing how we architect and deploy web applications.</p>
                
                <h2>Conclusion</h2>
                <p>The future of web development is exciting and full of possibilities. By staying informed about these trends, developers can build better, more efficient, and more user-friendly applications.</p>
            """,
            authorId='a1',
            publishDate=date(2024, 1, 25),
            readTime=8,
            likes=234,
            views=1520,
            isLiked=False,
            thumbnail='https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop'
        ),
        Article(
            id='2',
            title='Building Sustainable Design Systems',
            excerpt='Learn how to create design systems...',
            content="""
                <h2>What is a Design System?</h2>
                <p>A design system is a collection of reusable components, guided by clear standards, that can be assembled together to build any number of applications.</p>
                
                <h2>Key Components</h2>
                <p>Successful design systems include typography, color palettes, spacing guidelines, component libraries, and documentation.</p>
                
                <h2>Implementation Strategy</h2>
                <p>Start small with core components and gradually expand. Ensure buy-in from stakeholders and maintain comprehensive documentation.</p>
            """,
            authorId='a2',
            publishDate=date(2024, 1, 23),
            readTime=12,
            likes=189,
            views=945,
            isLiked=True,
            thumbnail='https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop'
        ),
        Article(
            id='3',
            title='Mastering React Performance',
            excerpt='Advanced techniques for optimizing...',
            content="""
                <h2>Performance Fundamentals</h2>
                <p>Understanding React's rendering cycle is crucial for optimizing performance. Learn about reconciliation, virtual DOM, and React's optimization strategies.</p>
                
                <h2>Optimization Techniques</h2>
                <p>Explore memo, useMemo, useCallback, and other React hooks that can help prevent unnecessary re-renders.</p>
                
                <h2>Measuring Performance</h2>
                <p>Use React DevTools Profiler and browser performance tools to identify bottlenecks in your applications.</p>
            """,
            authorId='a3',
            publishDate=date(2024, 1, 22),
            readTime=15,
            likes=312,
            views=2100,
            isLiked=False,
            thumbnail='https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'
        )
    ]
    db.add_all(articles)

    # Tags
    tags = [
        Tag(id='t1', name='Technology'), Tag(id='t2', name='Web Development'), Tag(id='t3', name='AI'),
        Tag(id='t4', name='Design'), Tag(id='t5', name='UX'), Tag(id='t6', name='Systems'),
        Tag(id='t7', name='React'), Tag(id='t8', name='Performance'), Tag(id='t9', name='JavaScript')
    ]
    db.add_all(tags)

    # ArticleTags
    article_tags = [
        ArticleTag(articleId='1', tagId='t1'), ArticleTag(articleId='1', tagId='t2'), ArticleTag(articleId='1', tagId='t3'),
        ArticleTag(articleId='2', tagId='t4'), ArticleTag(articleId='2', tagId='t5'), ArticleTag(articleId='2', tagId='t6'),
        ArticleTag(articleId='3', tagId='t7'), ArticleTag(articleId='3', tagId='t8'), ArticleTag(articleId='3', tagId='t9')
    ]
    db.add_all(article_tags)

    # Leaderboard
    leaderboard_entries = [
        Leaderboard(
            id='1',
            name='Stefano',
            avatar='https://www.plai-accelerator.com/content/uploads/2024/05/WhatsApp-Image-2024-05-30-at-22.20.28-e1717100490694.jpeg',
            level=15,
            totalXp=8750,
            articlesRead=127,
            streak=45
        ),
        Leaderboard(
            id='2',
            name='Antonio',
            avatar='https://www.plai-accelerator.com/content/uploads/2024/05/Antonio-Porro-AD-Gruppo-Mondadori-e1716021576318.jpeg',
            level=13,
            totalXp=6890,
            articlesRead=98,
            streak=23
        ),
        Leaderboard(
            id='3',
            name='Andrea',
            avatar='https://www.plai-accelerator.com/content/uploads/2024/04/Sito_Santagata.jpg',
            level=12,
            totalXp=5940,
            articlesRead=85,
            streak=18
        ),
        Leaderboard(
            id='4',
            name='Margherita',
            avatar='https://www.plai-accelerator.com/content/uploads/2025/05/corini-foto_346.jpg',
            level=12,
            totalXp=5200,
            articlesRead=76,
            streak=12
        ),
        Leaderboard(
            id='5',
            name='Caterina',
            avatar='https://www.plai-accelerator.com/content/uploads/2025/03/caterina-rutschmann_346_ok.png',
            level=9,
            totalXp=2450,
            articlesRead=34,
            streak=8
        ),
        Leaderboard(
            id='6',
            name='Francesco',
            avatar='https://www.plai-accelerator.com/content/uploads/2025/05/francesco_cavallo_346.jpeg',
            level=7,
            totalXp=1337,
            articlesRead=11,
            streak=3
        ),
        Leaderboard(
            id='7',
            name='Gabriele',
            avatar='https://forums.terraria.org/data/avatars/h/197/197802.jpg',
            level=6,
            totalXp=619,
            articlesRead=8,
            streak=2
        ),
        Leaderboard(
            id='8',
            name='Daniele',
            avatar='https://www.plai-accelerator.com/content/uploads/2024/05/giovannone_daniele_2.jpg',
            level=3,
            totalXp=322,
            articlesRead=6,
            streak=1
        ),
    ]

    db.add_all(leaderboard_entries)

    db.commit()
    db.close()
    print("Dati iniziali caricati con successo.")
