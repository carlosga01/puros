import Header from '../../components/Header';
import FeedTimeline from '../../components/FeedTimeline';
import RouteGuard from '../../components/RouteGuard';

export default function HomePage() {
  return (
    <RouteGuard requireAuth={true}>
      <Header>
        <FeedTimeline />
      </Header>
    </RouteGuard>
  );
}