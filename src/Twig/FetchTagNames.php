<?php declare(strict_types=1);

namespace BundleConfigurator\Twig;

use Shopware\Core\Framework\Context;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;

class FetchTagNames extends AbstractExtension
{
    private EntityRepository $tagRepository;

    public function __construct(EntityRepository $tagRepository)
    {
        $this->tagRepository = $tagRepository;
    }

    public function getFunctions()
    {
        return [
            new TwigFunction('fetchTagNames', [$this, 'fetchTagNames']),
        ];
    }

    public function fetchTagNames(?array $tagIds, Context $context): array
    {
        if (empty($tagIds)) {
            return [];
        }

        $criteria = new Criteria($tagIds);
        $tags = $this->tagRepository->search($criteria, $context)->getEntities();

        $tagNames = [];
        foreach ($tags as $tag) {
            $tagNames[] = $tag->getName();
        }

        return $tagNames; 
    }
}