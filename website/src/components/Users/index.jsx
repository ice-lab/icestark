import React from 'react';
import styles from './users.module.css';
import AreaWrapper from '../AreaWrapper';

const data = [
  {
    name: '淘宝',
    image: 'https://img.alicdn.com/tfs/TB1zdJliDtYBeNjy1XdXXXXyVXa-184-76.png',
  },
  {
    name: '飞猪',
    image: '//gw.alicdn.com/tfs/TB1UBEbfBv0gK0jSZKbXXbK2FXa-748-327.png'
  },
  {
    name: '饿了么',
    image: '//gw.alicdn.com/tfs/TB1pDIbfET1gK0jSZFrXXcNCXXa-1460-387.png'
  },
  {
    name: '菜鸟',
    image: 'https://img.alicdn.com/tfs/TB1LgSMibuWBuNjSszgXXb8jVXa-206-72.png',
  },
  {
    name: '钉钉',
    image: 'https://img.alicdn.com/tfs/TB1fdJliDtYBeNjy1XdXXXXyVXa-208-78.png',
  },
  {
    name: '阿里健康',
    image: 'https://img.alicdn.com/tfs/TB19a2XikyWBuNjy0FpXXassXXa-244-68.png',
  },
  {
    name: 'AliExpress',
    image: 'https://img.alicdn.com/tfs/TB1m7veieuSBuNjSsziXXbq8pXa-262-62.png',
  },
  {
    name: '阿里妈妈',
    image: 'https://img.alicdn.com/tfs/TB10Mjkib1YBuNjSszhXXcUsFXa-208-76.png',
  },
  {
    name: '阿里云',
    image: 'https://img.alicdn.com/tfs/TB1y9TNioR1BeNjy0FmXXb0wVXa-254-74.png',
    fill: true
  },
  {
    name: '优酷',
    image: 'https://img.alicdn.com/tfs/TB1SpDwiamWBuNjy1XaXXXCbXXa-242-46.png',
  },
  {
    name: 'Lazada',
    image: '//gw.alicdn.com/tfs/TB1aiAbfEz1gK0jSZLeXXb9kVXa-228-63.png',
  }
];

const showcases = [
  {
    name: '阿里创作者中心',
    image: 'https://img.alicdn.com/imgextra/i2/O1CN011pV2Gq24auj3ExIQD_!!6000000007408-2-tps-3570-1714.png_600x600.jpg'
  },
  {
    name: '轻课堂',
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01K8Bq6I1Pv9zOVkNw0_!!6000000001902-2-tps-3570-1714.png_600x600.jpg'
  },
  {
    name: '淘系小二工作台',
    image: 'https://img.alicdn.com/imgextra/i3/O1CN01UvVhB61rfs0ag60nB_!!6000000005659-2-tps-3570-1714.png_600x600.jpg',
  },
  {
    name: '千牛特价版（商家中心）',
    image: 'https://img.alicdn.com/imgextra/i4/O1CN010rpl2321v7LrPqIyI_!!6000000007046-2-tps-3570-1714.png_600x600.jpg',
  },
  {
    name: 'TESLA 交付工厂',
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01Gkx6nO24pZOxID5B9_!!6000000007440-2-tps-3570-1714.png_600x600.jpg'
  },
  {
    name: '淘宝直播',
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01i9ovqD1XxvIuPWoVi_!!6000000002991-2-tps-3570-1714.png_600x600.jpg'
  },
  {
    name: '饿了么商家版',
    image: 'https://img.alicdn.com/imgextra/i1/O1CN01ZzPJA829a44XQpuB1_!!6000000008083-2-tps-3570-1714.png_600x600.jpg'
  },
  {
    name: '阿里云控制台',
    image: 'https://img.alicdn.com/imgextra/i4/O1CN01vVl1UY1OUlY3UIV4P_!!6000000001709-2-tps-3570-1714.png_600x600.jpg'
  }
]

function Users() {
  return (
    <AreaWrapper
      title={'谁在使用'}
      decs={'icestark 广泛服务于阿里巴巴内及外部 300+ 应用'}
      contentStyle={styles.content}
      style={{
        minHeight: 'auto',
      }}
    >
      <ul className={styles.showcases}>
        {showcases.map((showcase, index) => (
          <li key={index}>
            <img alt={showcase.name} src={showcase.image} />
            <div className={styles.popup}>{showcase.name}</div>
          </li>
          ))
        }
      </ul>

      {data.map((item, index) => (
        <div key={index} className={styles.logo}>
          <img alt={item.name} src={item.image} className={item.fill && styles.fill}></img>
        </div>
      ))}

    </AreaWrapper>
  );
}

export default Users;
