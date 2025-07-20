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

  const [filters, setFilters] = useState({
    category: '',
    availability: '',
    size: '',
    colors: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt'
  });

  const [priceRange, setPriceRange] = useState({
    min: Number(filters.minPrice) || 0,
    max: Number(filters.maxPrice) || 10000
  });

  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({ 
    category: true, 
    availability: true, 
    size: true, 
    price: true, 
    color: true 
  });

  const updateQuery = useCallback((newFilters: typeof filters) => {
    const query = { ...newFilters };
    Object.keys(query).forEach(key => {
      const filterKey = key as keyof typeof query;
      if (query[filterKey] === '' || query[filterKey] === null) {
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
    let selectedColors = filters.colors ? filters.colors.split(',') : [];
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
    let selectedSizes = filters.size ? filters.size.split(',') : [];
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
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt'
    };
    setFilters(newFilters);
    setPriceRange({ min: 0, max: 10000 });
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