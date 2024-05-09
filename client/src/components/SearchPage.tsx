"use client";
import Masonry from "@mui/lab/Masonry";
import { Box } from "@mui/material";
import ProductCard from "@/components/ProductCard";
type Props = {
  searchData: ProductType[];
  searching: boolean;
  setSearchData:any
  setSearchInput: any;
  searchInput:any
};

function SearchPage({ searchData, searching,setSearchData, setSearchInput, searchInput }: Props) {
  return (
    <Box my={5} display="flex" gap={1.5} flexWrap="wrap">
      {searching ? <Box>Searching...</Box> : null}
      {!searching && searchData.length > 0 ? (
        <Masonry spacing={1.5} columns={{ xs: 1, sm: 2, md: 4 }}>
          {searchData.map((e) => {
            return <ProductCard setProductData={setSearchData} setSearchInput={setSearchInput} searchInput={searchInput} key={e.id} productData={e} />;
          })}
        </Masonry>
      ) : null}
      {!searching && searchData.length === 0 ? (
        <Box>Sorry, no results found</Box>
      ) : null}
    </Box>
  );
}

export default SearchPage;
