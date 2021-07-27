import React from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

function Badge({
  type = 'error',
  // 用这个来避免 Badge 被渲染成 导航
  text
}) {
  return (
    <div className={clsx(styles.badge, styles[type])}>
      {text}
    </div>
  );
}

export default Badge;
