<?php declare(strict_types=1);

namespace BundleConfigurator\Subscriber;

use Shopware\Core\Checkout\Customer\CustomerEntity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Storefront\Page\GenericPageLoadedEvent;
use Shopware\Core\Framework\Struct\ArrayStruct;


class CustomerGroupSubscriber implements EventSubscriberInterface
{
    private EntityRepository $customerRepository;

    public function __construct(EntityRepository $customerRepository)
    {
        $this->customerRepository = $customerRepository;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            GenericPageLoadedEvent::class => 'onGenericPageLoaded',
        ];
    }
    public function onGenericPageLoaded(GenericPageLoadedEvent $event): void
    {
        $salesChannelContext = $event->getSalesChannelContext();
        $customer = $salesChannelContext->getCustomer();
    
        if (!$customer) {
            return;
        }
    
        $criteria = new Criteria([$customer->getId()]);
        $criteria->addAssociation('group');
    
        /** @var CustomerEntity|null $fullCustomer */
        $fullCustomer = $this->customerRepository->search($criteria, $salesChannelContext->getContext())->first();
    
        if ($fullCustomer && $fullCustomer->getGroup()) {

            $event->getPage()->addExtension('enrichedCustomer', new ArrayStruct([
                'customer' => $fullCustomer,
            ]));
        }
    
}
}