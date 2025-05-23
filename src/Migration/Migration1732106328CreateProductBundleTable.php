<?php declare(strict_types=1);

namespace BundleConfigurator\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1732106328CreateProductBundleTable extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1732106328;
    }

    public function update(Connection $connection): void
    {
        $sql = <<<SQL
CREATE TABLE IF NOT EXISTS `product_bundle` (
    `id` BINARY(16) NOT NULL,
    `product_id` BINARY(16) NOT NULL,
    `discount` INT NOT NULL,
    `discount_type` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3),
     PRIMARY KEY (`id`),
     CONSTRAINT `fk.bundle.product_id` FOREIGN KEY (`product_id`)
                  REFERENCES `product` (`id`) ON DELETE CASCADE
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;
SQL;

        $connection->executeStatement($sql);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
