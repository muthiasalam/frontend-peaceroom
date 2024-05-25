import React, { useEffect } from "react";
import "./peminjaman-tabel-page.css";

const TableFooter = ({ range, setPage, page }) => {
  useEffect(() => {
    // Code useEffect di sini
  }, [page, setPage]);

  const renderPagination = () => {
    const currentPageIndex = range.indexOf(page);
    const prevPageIndex = currentPageIndex - 1;
    const nextPageIndex = currentPageIndex + 1;
    const lastIndex = range.length - 1;

    return (
      <div className="pagination">
        <button
          className={`button ${page === 1 && "disabled"}`}
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        {range.length <= 5 && range.map((pageNumber) => (
          <button
            key={pageNumber}
            className={`button ${pageNumber === page && "activeButton"}`}
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        {range.length > 5 && (
          <>
            {currentPageIndex >= lastIndex - 1 && (
              <>
                <button className="button" onClick={() => setPage(1)}>
                  1
                </button>
                <span className="ellipsis">...</span>
                {range.slice(lastIndex - 2, lastIndex + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`button ${pageNumber === page && "activeButton"}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </>
            )}
            {currentPageIndex === lastIndex - 2 && (
              <>
                <button className="button" onClick={() => setPage(1)}>
                  1
                </button>
                <span className="ellipsis">...</span>
                {range.slice(lastIndex - 3, lastIndex + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`button ${pageNumber === page && "activeButton"}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </>
            )}
            {currentPageIndex <= 1 && (
              <>
                {range.slice(0, 3).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`button ${pageNumber === page && "activeButton"}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <span className="ellipsis">...</span>
                <button
                  className="button"
                  onClick={() => setPage(range[lastIndex])}
                >
                  {range[lastIndex]}
                </button>
              </>
            )}
            {currentPageIndex === 2 && (
              <>
                {range.slice(0, 4).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`button ${pageNumber === page && "activeButton"}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <span className="ellipsis">...</span>
                <button
                  className="button"
                  onClick={() => setPage(range[lastIndex])}
                >
                  {range[lastIndex]}
                </button>
              </>
            )}
            {currentPageIndex > 2 && currentPageIndex < lastIndex - 2 && (
              <>
                <button
                  className="button"
                  onClick={() => setPage(1)}
                >
                  1
                </button>
                <span className="ellipsis">...</span>
                {range.slice(prevPageIndex, nextPageIndex + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`button ${pageNumber === page && "activeButton"}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <span className="ellipsis">...</span>
                <button
                  className="button"
                  onClick={() => setPage(range[lastIndex])}
                >
                  {range[lastIndex]}
                </button>
              </>
            )}
          </>
        )}
        <button
          className={`button ${page === range[lastIndex] && "disabled"}`}
          onClick={() => setPage(page + 1)}
          disabled={page === range[lastIndex]}
        >
          Next
        </button>
      </div>
    );
  };

  return <div className="tableFooter">{renderPagination()}</div>;
};

export default TableFooter;
