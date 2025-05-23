<?php declare(strict_types=1);

namespace BundleConfigurator;

use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\ActivateContext;
use Shopware\Core\Framework\Plugin\Context\DeactivateContext;
use Shopware\Core\Framework\Plugin\Context\InstallContext;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;
use Shopware\Core\Framework\Plugin\Context\UpdateContext;
use Doctrine\DBAL\Connection;


class BundleConfigurator extends Plugin
{
    public function install(InstallContext $installContext): void {}

    public function uninstall(UninstallContext $uninstallContext): void
    {
        parent::uninstall($uninstallContext);

        if ($uninstallContext->keepUserData()) {
            return;
        }

        $connection = $this->container->get(Connection::class);
        $connection->executeStatement('DROP TABLE IF EXISTS `product_bundle_translation`');
        $connection->executeStatement('DROP TABLE IF EXISTS `product_bundle_assigned_products`');
        $connection->executeStatement('DROP TABLE IF EXISTS `product_bundle`');

    }

    public function activate(ActivateContext $activateContext): void {}

    public function deactivate(DeactivateContext $deactivateContext): void {}

    public function update(UpdateContext $updateContext): void {}
}
