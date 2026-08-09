import type { Schema, Struct } from '@strapi/strapi';

export interface BlogArticleHeadline extends Struct.ComponentSchema {
  collectionName: 'components_blog_article_headlines';
  info: {
    displayName: 'headline';
  };
  attributes: {
    headline: Schema.Attribute.String;
    slug: Schema.Attribute.String;
  };
}

export interface BlogArticleLandscapeImage extends Struct.ComponentSchema {
  collectionName: 'components_blog_article_landscape_images';
  info: {
    displayName: 'LandscapeImage';
  };
  attributes: {
    image: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
    imageCaption: Schema.Attribute.Text;
  };
}

export interface BlogArticleParagraph extends Struct.ComponentSchema {
  collectionName: 'components_blog_article_paragraphs';
  info: {
    displayName: 'paragraph';
  };
  attributes: {
    paragraph: Schema.Attribute.Blocks;
  };
}

export interface BlogArticleParagraphWithImage extends Struct.ComponentSchema {
  collectionName: 'components_blog_article_paragraph_with_images';
  info: {
    displayName: 'paragraphWithImage';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imageCaption: Schema.Attribute.Text;
    imageShowsRight: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    isLandscape: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    paragraph: Schema.Attribute.Blocks & Schema.Attribute.Required;
  };
}

export interface InfoBlockButton extends Struct.ComponentSchema {
  collectionName: 'components_info_block_buttons';
  info: {
    description: '';
    displayName: 'button';
  };
  attributes: {
    color: Schema.Attribute.Enumeration<
      ['turquoise', 'orange', 'brown', 'beige']
    > &
      Schema.Attribute.Required;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blog-article.headline': BlogArticleHeadline;
      'blog-article.landscape-image': BlogArticleLandscapeImage;
      'blog-article.paragraph': BlogArticleParagraph;
      'blog-article.paragraph-with-image': BlogArticleParagraphWithImage;
      'info-block.button': InfoBlockButton;
    }
  }
}
