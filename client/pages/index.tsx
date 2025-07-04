import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
// import Bestsellers from '@/components/Bestsellers';
import NewArrivals from '@/components/NewArrivals';
import Exhibitions from '@/components/Exhibitions';
import Testimonials from '@/components/Testimonials';
import About from '@/components/About';
import Bestsellers from '@/components/Bestsellers';
export default function Home() {
  return (
    <Layout>
        <Hero />
        <Bestsellers />
        <NewArrivals />
        <Exhibitions />
        <Testimonials />
        <About />
    </Layout>
  );
} 