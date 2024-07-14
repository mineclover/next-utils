import React from "react";
import Link from "next/link";
import styles from "@/styles/EditorStyles.module.css";

const NavHeader: React.FC = () => {
  return (
    <header className={styles.navHeader}>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link href="/typescript" className={styles.navLink}>
              TypeScript
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/tsx" className={styles.navLink}>
              TSX
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/markdown" className={styles.navLink}>
              Markdown
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavHeader;
