import React from 'react';
import Button from '../Button';
import styles from './splash.module.css';

function Splash() {
  return (
    <header>
      <div className={styles.splash}>
        <h1 className={styles.title}>面向大型系统的微前端解决方案</h1>
        <p className={styles.subtitle}>
        使用 icestark 构建您的下一个微前端应用，或无痛迁移您目前的巨型应用。如同开发 SPA 应用一样简单，不仅解决多个开发团队协同问题，还带来了安全的沙箱、优秀的性能体验。
        </p>
        <div className={styles.buttons}>
          <Button url={'/docs/guide'}>快速起步</Button>
          <div style={{ minWidth: 20, minHeight: 20 }}></div>
          <Button primary={false} url="https://icestark-react.surge.sh/">
            查看示例
          </Button>
          <div style={{ minWidth: 20, minHeight: 20 }}></div>
          <Button primary={false} url="https://github.com/ice-lab/icestark">
            <div className={styles.github}>
              <i className="header-github-link"></i>
              GITHUB
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Splash;
