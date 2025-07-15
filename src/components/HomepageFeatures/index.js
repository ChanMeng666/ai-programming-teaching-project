import clsx from 'clsx';
import Heading from '@theme/Heading';
import WaveAnimation from '@site/src/components/WaveAnimation';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '循序渐进',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        从基础概念开始，通过实践案例逐步掌握AI编程技能，
        让学习过程更加轻松自然。
      </>
    ),
  },
  {
    title: '实践导向',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        提供丰富的实践案例和编程练习，
        帮助你更好地理解和应用AI编程知识。
      </>
    ),
  },
  {
    title: '技术前沿',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        紧跟AI技术发展前沿，
        学习最新的人工智能编程技术和应用。
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureImage}>
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className={styles.featureContent}>
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <WaveAnimation 
        direction="up" 
        color="hero-gradient" 
        height="60px"
        className={styles.featuresWave}
      />
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
