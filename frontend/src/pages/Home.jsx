import CaptionGenerator from '../tools/CaptionGenerator';
import HashtagGenerator from '../tools/HashtagGenerator';
import ContentIdeas from '../tools/ContentIdeas';
import BlogTopic from '../tools/BlogTopic';
import EmailReply from '../tools/EmailReply';
import ContentCalendar30Day from '../tools/ContentCalendar30Day';
import ProductDescriptionGenerator from '../tools/ProductDescriptionGenerator';

const Home = ({ selectedTool, userCredits, onCreditsUpdate, userPlan }) => {
  // Pass credits, update function, and plan to all tools
  const toolProps = {
    userCredits,
    onCreditsUpdate,
    userPlan
  };

  switch (selectedTool) {
    case 'caption':
      return <CaptionGenerator {...toolProps} />;

    case 'hashtag':
      return <HashtagGenerator {...toolProps} />;

    case 'ideas':
      return <ContentIdeas {...toolProps} />;

    case 'blog':
      return <BlogTopic {...toolProps} />;

    case 'email':
      return <EmailReply {...toolProps} />;

    case 'calendar30':
      return <ContentCalendar30Day {...toolProps} />;

    case 'productDescription':
      return <ProductDescriptionGenerator {...toolProps} />;

    default:
      return <CaptionGenerator {...toolProps} />;
  }
};

export default Home;