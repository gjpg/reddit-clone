// components/SortButtons/SortButtons.tsx

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './SortButtons.module.css';

interface SortButtonsProps {
  currentSort: 'hot' | 'new' | 'top';
  basePath?: string;
  useQueryParam?: boolean;
  hideBest?: boolean;
}

const SortButtons: React.FC<SortButtonsProps> = ({
  currentSort,
  basePath = '',
  useQueryParam = false,
  hideBest = false,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const availableSorts = ['new', 'top', ...(hideBest ? [] : ['hot'])];

  const timespans = ['day', 'month', 'year', 'all'] as const;
  const currentTimespan = searchParams.get('t') ?? 'all';

  const handleSortChange = (sort: string) => {
    if (useQueryParam) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('sort', sort);
      if (sort !== 'top') newParams.delete('t');
      navigate(`${basePath}?${newParams.toString()}`);
    } else {
      navigate(`${basePath}/${sort}`);
    }
  };

  const handleTimespanChange = (t: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('t', t);
    navigate(`${basePath}?${newParams.toString()}`);
  };

  return (
    <div className={styles.sortBar}>
      <div className={styles.sortButtons}>
        {availableSorts.map((sort) => (
          <button
            key={sort}
            onClick={() => handleSortChange(sort)}
            className={currentSort === sort ? styles.active : ''}
          >
            {sort.toUpperCase()}
          </button>
        ))}
      </div>

      {currentSort === 'top' && (
        <div className={styles.timeFilter}>
          {timespans.map((t) => (
            <button
              key={t}
              onClick={() => handleTimespanChange(t)}
              className={currentTimespan === t ? styles.active : ''}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortButtons;
