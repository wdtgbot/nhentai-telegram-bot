import Context from 'telegraf/typings/context'
import config  from '../../../config'
import i18n 	 from '../../i18n'
import Verror  from 'verror'

import { getMangaMessage, sliceByHalf } from '../some_functions'

import {
  InlineQueryResultArticle,
  InlineQueryResultPhoto,
  InlineKeyboardMarkup
} 										from 'typegram'
import { Document } 	from 'mongoose'
import { UserSchema } from '../../models/user.model'

const favoritesReplyMarkup: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      {
        text:                             i18n.__('favorites'),
        switch_inline_query_current_chat: '',
      },
    ],
  ],
}

export default async function replyWithFavoritesInline(
  ctx: Context,
  inlineQuery: string,
  specifiedPage: number | undefined,
  user: UserSchema & Document<any, any, UserSchema>
): Promise<void> {
  const searchType: 'photo' | 'article' = config.show_favorites_as_gallery ? 'photo' : 'article'

  if (searchType === 'photo') {
    const results: InlineQueryResultPhoto[] = await getFavotitesPhoto(user, specifiedPage, inlineQuery)
    try {
      ctx.answerInlineQuery(results, {
        cache_time:  0,
        is_personal: true,
      })
    } catch (error){
      throw new Verror(error, 'Answer Inline Favorites Photo')
    }
  } else {
    const results: InlineQueryResultArticle[] = await getFavotitesArticle(user, specifiedPage, inlineQuery)
    try {
      ctx.answerInlineQuery(results, {
        cache_time:  0,
        is_personal: true,
      })
    } catch (error){
      throw new Verror(error, 'Answer Inline Favorites Article')
    }
  }
}

async function getFavotitesArticle (
  user: UserSchema & Document<any, any, UserSchema>,
  specifiedPage: number | undefined,
  inlineQuery: string
){
  const results: InlineQueryResultArticle[] = []
  for (const favorite of user.favorites){
    const caption = getMangaMessage(favorite, favorite.telegraph_url)
    const description = sliceByHalf(favorite.title)
    const heart = config.like_button_true
    const InlineKeyboardMarkup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text:          i18n.__('fix_button'),
            callback_data: 'fix_' + favorite._id,
          },
          { text: 'Telegra.ph', url: String(favorite.telegraph_url) },
          { text: heart, callback_data: 'like_' + favorite._id },
        ]
      ]
    }
    results.push({
      id:    favorite._id,
      type:  'article',
      title: favorite.title
        .replace('<', '\\<')
        .replace('>', '\\>')
        .trim(),
      description: description
        .replace('<', '\\<')
        .replace('>', '\\>')
        .trim(),
      thumb_url:             favorite.thumbnail,
      input_message_content: {
        message_text: caption,
        parse_mode:   'HTML',
      },
      reply_markup: InlineKeyboardMarkup
    })
  }

  const pageNumber = specifiedPage || 1
  results.reverse()
  results.splice(0, 48 * (pageNumber - 1))

  if (results.length > 48) {
    const num_of_superfluous = results.length - 48
    results.splice(48, num_of_superfluous)
  }

  const nextPageSwitch = `/p${+pageNumber + 1} ${inlineQuery}`

  results.unshift({
    id:                    String(Math.floor(Math.random() * 10000000)),
    type:                  'article',
    title:                 i18n.__('favorites'),
    description:           i18n.__('favorites_tip_desctiption'),
    thumb_url:             config.favorites_icon_inline,
    input_message_content: {
      message_text: i18n.__('tap_to_open_favorites'),
      parse_mode:   'HTML',
    },
    reply_markup: favoritesReplyMarkup,
  })

  if (pageNumber < Math.ceil(results.length / 48)) {
    results.push({
      id:          String(9696969696),
      type:        'article',
      title:       i18n.__('next_page_tip_title'),
      description: `TAP HERE or Just add "/p${+pageNumber + 1
      }" to search qerry: (@nhentai_mangabot ${nextPageSwitch})`,
      thumb_url:             config.next_page_icon_inline,
      input_message_content: {
        message_text:
            i18n.__('next_page_tip_message'),
        parse_mode: 'HTML',
      },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text:                             i18n.__('next_page_button'),
              switch_inline_query_current_chat: nextPageSwitch,
            },
          ],
        ],
      },
    })
  }
  return results
}

async function getFavotitesPhoto(
  user: UserSchema & Document<any, any, UserSchema>,
  specifiedPage: number | undefined,
  inlineQuery: string
): Promise<InlineQueryResultPhoto[]> {
  const results: InlineQueryResultPhoto[] = []
  for (const favorite of user.favorites){
    const caption = getMangaMessage(favorite, favorite.telegraph_url)
    const description = sliceByHalf(favorite.title)
    const heart = config.like_button_true
    const InlineKeyboardMarkup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text:          i18n.__('fix_button'),
            callback_data: 'fix_' + favorite._id,
          },
          { text: 'Telegra.ph', url: String(favorite.telegraph_url) },
          { text: heart, callback_data: 'like_' + favorite._id },
        ]
      ]
    }
    results.push({
      id:    favorite._id,
      type:  'photo',
      title: favorite.title
        .replace('<', '\\<')
        .replace('>', '\\>')
        .trim(),
      description: description
        .replace('<', '\\<')
        .replace('>', '\\>')
        .trim(),
      thumb_url:             favorite.thumbnail,
      photo_url:             favorite.thumbnail,
      input_message_content: {
        message_text: caption,
        parse_mode:   'HTML',
      },
      reply_markup: InlineKeyboardMarkup
    })
  }

  const pageNumber = specifiedPage || 1
  results.reverse()
  results.splice(0, 48 * (pageNumber - 1))

  if (results.length > 48) {
    const num_of_superfluous = results.length - 48
    results.splice(48, num_of_superfluous)
  }

  const nextPageSwitch = `/p${+pageNumber + 1} ${inlineQuery}`

  results.unshift({
    id:                    String(Math.floor(Math.random() * 10000000)),
    type:                  'photo',
    title:                 i18n.__('favorites'),
    description:           i18n.__('favorites_tip_desctiption'),
    photo_url:             config.favorites_icon_inline,
    thumb_url:             config.favorites_icon_inline,
    input_message_content: {
      message_text: i18n.__('tap_to_open_favorites'),
      parse_mode:   'HTML',
    },
    reply_markup: favoritesReplyMarkup,
  })

  if (pageNumber < Math.ceil(results.length / 48)) {
    results.push({
      id:          String(9696969696),
      type:        'photo',
      title:       i18n.__('next_page_tip_title'),
      description: `TAP HERE or Just add "/p${+pageNumber + 1
      }" to search qerry: (@nhentai_mangabot ${nextPageSwitch})`,
      photo_url:             config.next_page_icon_inline,
      thumb_url:             config.next_page_icon_inline,
      input_message_content: {
        message_text:
            i18n.__('next_page_tip_message'),
        parse_mode: 'HTML',
      },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text:                             i18n.__('next_page_button'),
              switch_inline_query_current_chat: nextPageSwitch,
            },
          ],
        ],
      },
    })
  }
  return results
}