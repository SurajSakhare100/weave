import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

interface UseProductFiltersReturn {
  filters: {
    category: string;
    availability: string;
    size: string;
    colors: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  openFilters: { [key: string]: boolean };
  minInputRef: React.RefObject<HTMLInputElement>;
  maxInputRef: React.RefObject<HTMLInputElement>;
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleColorSwatchClick: (color: string) => void;
  handlePriceChange: (min: number, max: number) => void;
  handleSizeClick: (sizeOption: string) => void;
  handleClearFilters: () => void;
  handleAvailabilityToggle: () => void;
  handleCategoryClick: (slug: string) => void;
  toggleFilter: (key: string) => void;
}

const useProductFilters = (): UseProductFiltersReturn => {
  const router = useRouter();
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  // Better default price range based on seed file prices
  const defaultMinPrice = router.query.minPrice ? Number(router.query.minPrice) : 0;
  const defaultMaxPrice = router.query.maxPrice ? Number(router.query.maxPrice) : 3000;

  const [filters, setFilters] = useState({
    category: (router.query.category as string) || '',
    availability: (router.query.availability as string) || '',
    size: (router.query.size as string) || '',
    colors: (router.query.colors as string) || '',
    minPrice: defaultMinPrice.toString(),
    maxPrice: defaultMaxPrice.toString(),
    sort: (router.query.sort as string) || '-createdAt'
  });

  const [priceRange, setPriceRange] = useState({
    min: defaultMinPrice,
    max: defaultMaxPrice
  });

  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({ 
    category: false, 
    availability: false, 
    size: false, 
    price: false, 
    color: false 
  });

  const updateQuery = useCallback((newFilters: typeof filters) => {
    const query = { ...newFilters };
    Object.keys(query).forEach(key => {
      const filterKey = key as keyof typeof query;
      if (query[filterKey] === '' || query[filterKey] === null || query[filterKey] === undefined) {
        delete query[filterKey];
      }
    });

    router.push({
      pathname: '/products',
      query,
    }, undefined, { shallow: true });
  }, [router]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const handleColorSwatchClick = useCallback((color: string) => {
    let selectedColors = filters.colors ? filters.colors.split(',').filter(c => c.trim()) : [];
    
    if (selectedColors.includes(color)) {
      selectedColors = selectedColors.filter(c => c !== color);
    } else {
      selectedColors.push(color);
    }
    
    const newFilters = { ...filters, colors: selectedColors.join(',') };
    setFilters(newFilters);
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const handlePriceChange = useCallback((min: number, max: number) => {
    setPriceRange({ min, max });
    const newFilters = { ...filters, minPrice: min.toString(), maxPrice: max.toString() };
    setFilters(newFilters);
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const handleSizeClick = useCallback((sizeOption: string) => {
    let selectedSizes = filters.size ? filters.size.split(',').filter(s => s.trim()) : [];
    
    if (selectedSizes.includes(sizeOption)) {
      selectedSizes = selectedSizes.filter(s => s !== sizeOption);
    } else {
      selectedSizes.push(sizeOption);
    }
    
    const newFilters = { ...filters, size: selectedSizes.join(',') };
    setFilters(newFilters);
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const handleClearFilters = useCallback(() => {
    const newFilters = {
      category: '',
      availability: '',
      size: '',
      colors: '',
      minPrice: '0',
      maxPrice: '3000',
      sort: '-createdAt'
    };
    setFilters(newFilters);
    setPriceRange({ min: 0, max: 3000 });
    router.push({ pathname: '/products' }, undefined, { shallow: true });
  }, [router]);

  const handleAvailabilityToggle = useCallback(() => {
    const newFilters = { ...filters, availability: filters.availability === 'true' ? '' : 'true' };
    setFilters(newFilters);
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const handleCategoryClick = useCallback((slug: string) => {
    const newFilters = { ...filters, category: filters.category === slug ? '' : slug };
    setFilters(newFilters);
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const toggleFilter = useCallback((key: string) => {
    setOpenFilters(f => ({ ...f, [key]: !f[key] }));
  }, []);

  return {
    filters,
    priceRange,
    openFilters,
    minInputRef,
    maxInputRef,
    handleFilterChange,
    handleColorSwatchClick,
    handlePriceChange,
    handleSizeClick,
    handleClearFilters,
    handleAvailabilityToggle,
    handleCategoryClick,
    toggleFilter,
  };
};

export default useProductFilters; 