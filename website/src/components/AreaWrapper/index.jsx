import React from 'react';
import clsx from 'clsx';
import styles from './area.module.css';

function AreaWrapper({
  title,
  decs,
  contentStyle,
  containerStyle,
  children,
  isBlock,
  style,
  hiddenSubTitle
}) {
  return (
    <div className={isBlock && styles.block}>
      <div className={clsx(styles.container, containerStyle)} style={style || {}}>
        <div className={clsx(styles.titleContent, hiddenSubTitle && styles.hiddenSubTitle)}>
          <h2>{title}</h2>
          { !hiddenSubTitle && (<p>{decs}</p>)}
        </div>
        <div className={contentStyle}>{children}</div>
      </div>
    </div>
  );
}

export default AreaWrapper;
