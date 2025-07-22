import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import Bestsellers from '@/components/home/Bestsellers';
import NewArrivals from '@/components/home/NewArrivals';
import Exhibitions from '@/components/home/Exhibitions';
import Testimonials from '@/components/home/Testimonials';
import About from '@/components/home/About';
import CategoryScroller from '@/components/home/EssentialsBar';

const Home: React.FC = () => {
  return (
    <MainLayout>
      <Hero />
      <Bestsellers />
      <NewArrivals />
      <Exhibitions />
      <CategoryScroller />
      <Testimonials />
      <About />
    </MainLayout>
  );
};

export default Home; 