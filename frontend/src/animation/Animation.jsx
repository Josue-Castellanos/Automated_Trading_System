import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export const useScrollAnimation = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.1,
        triggerOnce: false
    });

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
        else {
            controls.start('hidden');
        }
    }, [controls, inView]);

    return [ref, controls];
};

export const AnimatedSection = ({ children, delay = 0 }) => {
    const [ref, controls] = useScrollAnimation();

    return (
        <motion.section ref={ref} initial="hidden" animate={controls} 
            variants={{
                visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                        duration: 0.8,
                        ease: "easeOut",
                        delay: delay * 0.2
                    }
                },
                hidden: { 
                    opacity: 0, 
                    y: 50 
                }
            }}>{children}
        </motion.section>
    );
};

export const FeatureCard = ({ icon, title, description, index }) => {
    const [ref, inView] = useInView({
        threshold: 0.1,
        triggerOnce: true
    });
  
    return (
        <motion.div
            ref={ref}
            className="feature-card"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}>
            <div className="feature-icon-container">
                {icon}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </motion.div>
    );
};

