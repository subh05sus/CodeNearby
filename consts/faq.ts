export interface FAQItem {
  question: string;
  answer: string;
}
export const faqs: FAQItem[] = [
  {
    question: "What is Codenearby?",
    answer:
      "Codenearby is a platform that connects developers based on location, allowing them to network, collaborate on projects, share knowledge, and participate in hackathons or meetups.",
  },
  {
    question: "How can I find developers near me?",
    answer:
      "Simply sign up on Codenearby, enable location services, and browse through the list of developers around you. You can also filter by skills and interests.",
  },
  {
    question: "Is Codenearby free to use?",
    answer:
      "Yes! Codenearby is completely free for developers to network, chat, collaborate, and join community discussions. Additional premium features may be introduced in the future.",
  },
  {
    question: "What is AI-Connect?",
    answer:
      "AI-Connect is our intelligent assistant that helps you find GitHub developers based on skills, location, or specific requirements. It uses Meta Llama AI to analyze GitHub profiles and provide personalized developer recommendations through a conversational interface.",
  },
  {
    question: "How accurate are the AI-Connect search results?",
    answer:
      "AI-Connect uses real-time data from GitHub to provide accurate developer information. Results quality depends on the specificity of your query and the public information available on developer profiles. You can refine your search by asking follow-up questions.",
  },
  {
    question: "What kind of discussions happen in the feed?",
    answer:
      "The feed is where developers share insights, code snippets, troubleshooting tips, tech news, and even fun programming memes.",
  },
  {
    question: "What is the Gathering feature?",
    answer:
      "The Gathering feature allows developers to create temporary meeting rooms where users can join via a unique link. Participants can chat, share polls, images, and sometimes even interact anonymously.",
  },
  {
    question: "How does GitHub integration work?",
    answer:
      "Codenearby fetches your public GitHub profile data, including your bio, repositories, and contributions, to auto-fill your profile. This makes it easier for others to find and connect with developers based on their expertise.",
  },

];
