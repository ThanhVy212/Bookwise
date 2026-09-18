import BookOverviewSkeleton from "@/components/skeletons/BookOverviewSkeleton";
import BookListSkeleton from "@/components/skeletons/BookListSkeleton";

const HomeLoading = () => {
  return (
    <>
      <BookOverviewSkeleton />
      <BookListSkeleton className="mt-28" count={12} />
    </>
  );
};

export default HomeLoading;
