<?php declare(strict_types=1);

namespace BundleConfigurator\Struct;

use Shopware\Core\Framework\Struct\Struct;

class BundlesParamsStruct extends Struct
{
    /**
     * @var mixed
     */
    private $bundlesParams;

    public function __construct($bundlesParams)
    {
        $this->bundlesParams = $bundlesParams;
    }

    public function getBundlesParams()
    {
        return $this->bundlesParams;
    }

    public function setBundlesParams($bundlesParams): void
    {
        $this->bundlesParams = $bundlesParams;
    }
}
