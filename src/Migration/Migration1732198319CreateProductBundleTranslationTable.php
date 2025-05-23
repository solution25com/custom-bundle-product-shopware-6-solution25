<?php declare(strict_types=1);

namespace BundleConfigurator\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @internal
 */
class Migration1732198319CreateProductBundleTranslationTable extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1732198319;
    }

    public function update(Connection $connection): void
    {

        $query = <<<SQL
CREATE TABLE IF NOT EXISTS `product_bundle_translation` (
    `product_bundle_id` BINARY(16) NOT NULL,
    `language_id` BINARY(16) NOT NULL,
    `name` VARCHAR(255),
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NULL,
    PRIMARY KEY (`product_bundle_id`, `language_id`),
    CONSTRAINT `fk.product_bundle_translation.product_bundle_id` FOREIGN KEY (`product_bundle_id`)
        REFERENCES `product_bundle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk.product_bundle_translation.language_id` FOREIGN KEY (`language_id`)
        REFERENCES `language` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;
SQL;
        $connection->executeStatement($query);

    }
}
